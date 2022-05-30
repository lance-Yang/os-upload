import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Progress } from 'antd';
import SparkMD5 from 'spark-md5'

import instance from '@/api/instance';
import { UPLOAD_FILE, INFO } from '@/api/api';
import styles from './home.less';
import useEventListener from '../hooks/useEventListener';
import { createFileChunk, calculateHashWorker } from '@/utils/validator'

export default function SliceUpload() {

    const [file, setFile] = useState(null);
    const [fileChunk, setFileChunk] = useState({
        progress: 0,
        chunk: [],
        cubeWidth: 0,
    })
    const [progressNum, setProgressNum] = useState(0)
    const [borderColor, setBorderColor] = useState('#eee')

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

        // const hash2 = await claculateHashSample(file);

        console.log("chunks", chunks)
        // console.log("文件的hash值1：", hash)
        // console.log("文件的hash值2：", hash2)

        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', hash)

        instance.post(UPLOAD_FILE, formData, {
            onUploadProgress: progress => {
                const count = Number(((progress.loaded / progress.total) * 100).toFixed(2));
                setProgressNum(count)
                console.log(count, 'count..')
            }
        }).then(res => {
            console.log(res, '文件上传')
        })
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

            {/* <h3>網格進度條</h3>
            <div className={styles.cube_container}>
                {
                    fileChunk.chunk.map(item => (
                        <div className={styles.cube}>

                        </div>
                    ))
                }

            </div> */}
        </div>
    )

}