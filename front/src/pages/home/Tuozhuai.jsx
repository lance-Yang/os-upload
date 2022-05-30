import React, { useEffect, useRef, useState } from 'react';
import { Button, message , Progress  } from 'antd';

import instance from '@/api/instance';
import { UPLOAD_FILE, INFO } from '@/api/api';
import styles from './home.less';
import useEventListener from '../hooks/useEventListener';

export default function Tuozhuai() {

    const [file, setFile] = useState(null);
    const [progressNum,setProgressNum] = useState(0)
    const [borderColor, setBorderColor] = useState('#eee')


    const handleChangeFile = (e) => {
        const file = e.target.files[0];
        setFile(file)
        console.log(e.target.files, 'files.....')
    }

    const handleUpload = () => {
        if (!file) {
            message.error('请选择文件')
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name)
        // 上传
        instance.post(UPLOAD_FILE, formData,{
            // axios自带的上传方法，我们这里可以直接拿过来使用
            onUploadProgress:progress => {
                const count = Number(((progress.loaded/progress.total)*100).toFixed(2));
                setProgressNum(count)
                console.log(count,'count..')
            }
        }).then(res => {
            console.log(res, '文件上传')
        })
    }

    // 鼠标拖拽文件移入事件
    const handleDragOver = (e) => {
        e.preventDefault()
        setBorderColor('red')
    }
    // 离开事件
    const handleDragLeave = (e) => {
        e.preventDefault()
        setBorderColor('#eee')
    }
    // 文件放下事件
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
            <Progress percent={progressNum} />
            <Button type='primary' disabled={file == null} onClick={handleUpload}>上传</Button>
        </div>
    )

}