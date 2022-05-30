import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Progress } from 'antd';
import SparkMD5 from 'spark-md5'
import cls from 'classnames'

import instance from '@/api/instance';
import { UPLOAD_FILE, INFO } from '@/api/api';
import styles from './home.less';
import useEventListener from '../hooks/useEventListener';
import { createFileChunk, calculateHashWorker } from '@/utils/validator'


// 網格進度條
export default function SliceUpload2() {

    const [file, setFile] = useState(null);
    const [fileChunk, setFileChunk] = useState([])
    const [progressNum, setProgressNum] = useState(0)
    const [borderColor, setBorderColor] = useState('#eee')
    // const [uploadProgress, setUploadProgress] = useState(0)

    // useEffect(() => {
    //     if (!file || fileChunk.length) {
    //         return 0
    //     }
    //     const loaded = fileChunk.map(item => item.chunk.size * item.progress)
    //         .reduce((acc, cur) => acc + cur, 0);
    //     const progress = parseInt(((loaded * 100) / file.size).toFixed(2));
    //     setUploadProgress(progress)
    // }, [fileChunk.length > 0])

    // const calcProgress = (file, arr) => {
    //     if (!file || arr.length) {
    //         return 0
    //     }
    //     const loaded = fileChunk.map(item => item.chunk.size * item.progress)
    //         .reduce((acc, cur) => acc + cur, 0);
    //     return parseInt(((loaded * 100) / file.size).toFixed(2));
    // }


    // 利用浏览器自带的一个requestIdleCallback函数执行我们的hash计算，这样不会影响浏览器的主线程
    const calculateHashRequestIdle = async (chunks) => {
        return new Promise(resolve => {
            const spark = new SparkMD5.ArrayBuffer();
            let count = 0;
            // 追加
            const appendToSpark = async file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = e => {
                        spark.append(e.target.result);
                        resolve()
                    };
                })
            };
            const workLoop = async deadline => {
                // 获取当前帧的剩余时间
                while (count < chunks.length && deadline.timeRemaining() > 1) {
                    //空闲时间，且有任务
                    await appendToSpark(chunks[count].file);
                    count++;
                    if (count < chunks.length) {
                        const hashProgress = Number(((100 * count) / chunks.length).toFixed(2));
                        setProgressNum(hashProgress)
                    } else {
                        setProgressNum(100);
                        resolve(spark.end())
                    }
                }
                window.requestIdleCallback(workLoop)
            }
            // 浏览器一有空闲就会调用workloop
            window.requestIdleCallback(workLoop)
        })
    }


    // 抽样hash计算
    const claculateHashSample = (fileObj) => {
        // 布隆过滤器  判断一个数据存在与否
        // 1个G的文件，抽样后5M以内
        // hash一样，文件不一定一样
        // hash不一样，文件一定不一样
        return new Promise(resolve => {
            const spark = new SparkMD5.ArrayBuffer();
            const reader = new FileReader();

            const size = fileObj?.size;
            const offset = 2 * 1024 * 1024;
            // 第一个2M，最后一个区块数据全要
            let chunks = [fileObj.slice(0, offset)];

            let cur = offset;

            while (cur < size) {
                // 取最后一个区块
                if (cur + offset >= size) {
                    chunks.push(fileObj.slice(cur, cur + offset))
                } else {
                    // 中间的区块
                    const mid = cur + offset / 2;
                    const end = cur + offset;
                    chunks.push(fileObj.slice(cur, cur + 2));
                    chunks.push(fileObj.slice(mid, mid + 2));
                    chunks.push(fileObj.slice(end - 2, end))
                }
                cur += offset;
            };
            // 中间的，取前后各2个字节
            reader.readAsArrayBuffer(new Blob(chunks));
            reader.onload = e => {
                spark.append(e.target.result);
                setProgressNum(100)
                resolve(spark.end());
            }

        })
    }

    // 控制上传并发数,错误并重试
    const sendRequest = (chunks, limit = 3) => {
        return new Promise((resolve,reject) => {
            const len = chunks.length;
            let counter = 0;

            const start = async () => {
                // 从数组删除第一个元素并返回
                const task = chunks.shift();
                if (task) {
                    const { form, index } = task;

                    try {
                        await instance.post(UPLOAD_FILE, form);

                        if (counter == len - 1) {
                            // 最后一个任务
                            resolve()
                        } else {
                            counter ++ 
                            // 启动下一个任务
                            start()
                        }

                    } catch (err) {
                        
                    }

                }

            }

            while (limit > 0) {
                // 情动limit个任务
                // 模拟一下延迟
                setTimeout(() => {
                    start()
                }, 2000);

                limit -= 1
            }
        })
    }


    const uploadChunks = async (chunks, hash, uploadedList) => {   
        // let newChunks = fileChunk;
        const requests = chunks.filter(chunk => {
            return uploadedList.indexOf(chunk.name) == -1
        }).map((chunk, index) => {
            const form = new FormData();
            form.append('chunk', chunk.chunk)
            form.append('hash', chunk.hash)
            form.append('name', chunk.name)
            // form.append('index',chunk.index)
            return form;
        }).map((form, index) => instance.post(UPLOAD_FILE, form, {
            onUploadProgress: progress => {
                // 不是整体的进度条了，而是每个区块有自己的进度条，整体的进度条需要计算
                // newChunks[index] = {
                //     ...newChunks[index],
                //     progress: Number(((progress.loaded / progress.total) * 100).toFixed(2))
                // }
                // newChunks.push(newChunks[index])
                // setUploadProgress(Number(((progress.loaded / progress.total) * 100).toFixed(2)))
               
            }
        }).then(res => {
            // console.log(res, '文件上传')
        }))
        // console.log(fileChunk, 'tempChunk......')
        // setFileChunk(fileChunk)
        // setFileChunk(newChunks)
        await sendRequest(requests,3)
        // await Promise.all(requests)
        await mergeFile(hash)
    }

    const mergeFile = async (hash) => {
        const ret = await instance.post('/mergefile', {
            ext: file.name.split('.').pop(),
            size: 1 * 1024 * 1024,
            hash: hash
        })

    }

    const handleChangeFile = (e) => {
        const file = e.target.files[0];
        setFile(file)
        console.log(e.target.files, 'files.....')
    }

    // 上传文件
    const handleUpload = async () => {
        if (!file) {
            message.error('请选择文件')
        }
        //切片
        const chunks = await createFileChunk(file);
        // const hash = await calculateHashWorker(chunks);
        const hash = await calculateHashRequestIdle(chunks);

        // 切完片和计算hash值后询问后端是否存在上传文件的碎片，如果存在提示秒传成功
        // 如果没有，全量上传
        const res = await instance.post('/checkfile', {
            hash: hash,
            ext:file.name.split('.').pop()
        })
        if (res?.data?.uploaded) {
            return message.success('秒传成功!')
        }

        let newChunks = chunks.map((chunk, index) => {
            // 切片的名字 
            const name = hash + '-' + index;
            return {
                hash,
                name,
                index,
                chunk: chunk.file,
                progress: res?.data?.uploadedList.indexOf(name)>-1 ?100:0
            }
        })
        setFileChunk(newChunks)
        await uploadChunks(newChunks,hash,res?.data?.uploadedList)

    }
    const handleDragOver = (e) => {
        e.preventDefault()
        setBorderColor('red')
    }
    const handleDragLeave = (e) => {
        e.preventDefault()
        setBorderColor('#eee')
    }

    const handleDrop = (e) => {
        const fileList = e.dataTransfer.files;
        setFile(fileList[0]);
        setBorderColor('#eee')
        e.preventDefault()

    }


    useEventListener("dragover", handleDragOver);
    useEventListener("dragleave", handleDragLeave)
    useEventListener("drop", handleDrop)

    return (
        <div>
            <div style={{ borderColor }} draggable onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={styles.drag}>
                <input type="file" onChange={handleChangeFile} />
            </div>
            {
                file !== null && <div>
                    文件名<span>{file.name}</span>
                </div>
            }
            hash文件上傳進度
            <Progress percent={progressNum} />
            <Button type='primary' disabled={file == null} onClick={handleUpload}>上传</Button>

            <h3>網格進度條</h3>
            <div className={styles.cube_container} style={{ width: `${Math.ceil(Math.sqrt(fileChunk.length)) * 16}px` }}>
                {
                    fileChunk.map(item => (
                        <div key={item.name} className={cls(styles.cube, {
                            [styles.uploading]: item.progress > 0 && item.progress < 100,
                            [styles.success]: item.progress == 100,
                            [styles.error]: item.progress < 0,
                        })} >

                        </div>
                    ))
                }
            </div>
            {/* 所有区块上次进度
            <Progress percent={calcProgress(file, fileChunk)} /> */}

        </div>
    )

}