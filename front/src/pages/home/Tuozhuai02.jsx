import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Progress } from 'antd';

import instance from '@/api/instance';
import { UPLOAD_FILE, INFO } from '@/api/api';
import styles from './home.less';
import useEventListener from '../hooks/useEventListener';
import { isGif, isPng, isJpg } from '@/utils/validator'

export default function Tuozhuai02() {

    const [file, setFile] = useState(null);
    const [progressNum, setProgressNum] = useState(0)
    const [borderColor, setBorderColor] = useState('#eee')


    const handleChangeFile = (e) => {
        const file = e.target.files[0];
        setFile(file)
        console.log(e.target.files, 'files.....')
    }


    const handleDragOver = (e) => {
        e.preventDefault()
        setBorderColor('red')
    }
    const handleDragLeave = (e) => {
        e.preventDefault()
        setBorderColor('#eee')
    }

    const isImage = async (file) => {
        return await isGif(file) || await isPng(file) || await isJpg(file)
    }

    const handleDrop = async (e) => {
        const fileList = e.dataTransfer.files;
        setFile(fileList[0]);
        e.preventDefault()
        setBorderColor('#eee')
    }
    const handleUpload = async () => {
        if (!file) {
            message.error('请选择文件')
        }
        if (await isImage(file)) {
            console.log('格式正确。。。')
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name)

            instance.post(UPLOAD_FILE, formData, {
                onUploadProgress: progress => {
                    const count = Number(((progress.loaded / progress.total) * 100).toFixed(2));
                    setProgressNum(count)
                }
            }).then(res => {
                console.log(res, '文件上传')
            })
        }else{
            console.log('格式不正确!')
        }
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
            {/* 进度条 */}
            <Progress percent={progressNum} />
            <Button type='primary' disabled={file == null} onClick={handleUpload}>上传</Button>
        </div>
    )

}