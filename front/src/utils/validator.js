

async function readFileBlob(blob){
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function (){
            console.log(reader.result,'reader.result');
            const res = reader.result?.split('').map(f => f.charCodeAt()).map(f => f.toString(16).toUpperCase()).join('')

            resolve(res)
        }
        reader.readAsBinaryString(blob)
    })

}
export const isGif = async (file) => {
    const ret = await readFileBlob(file.slice(0,6))
    const isGif = (ret=='47 49 46 38 39 61') || (ret=='47 49 46 38 37 61')
    return isGif
}
export const isPng = async (file) => {
    const ret = await readFileBlob(file.slice(0,8))
    console.log(ret,'png.......')
    const ispng = (ret == "89 50 4E 47 0D 0A 1A 0A")
    return ispng
}
export const isJpg = async (file) => {
    const len = file.size
    const start = await readFileBlob(file.slice(0,2))
    const end = await readFileBlob(file.slice(-2,len))
    console.log('start:',start,"end:",end)
    const isjpg = (start=='FFD8') && (end=='FFD9')
    return isjpg
}
// 文件切片大小,默认是1兆
const CHUNK_SIZE = 1*1024*1024
// 切片
export const createFileChunk = async (file,size=CHUNK_SIZE) => {
    const chunks = [];
    let cur = 0;
    while(cur < file?.size){
        chunks.push({index:cur,file:file.slice(cur,cur+size)})
        cur+=size
    }
    return chunks;
}
// 利用浏览器的web_woker来计算文件的hash值
export const calculateHashWorker = async (chunks) => {
    return new Promise(resolve => {
        const worker = new Worker('./hash.js');
        worker.postMessage({chunks:chunks}) ;
        worker.onmessage = e => {
            const {progress,hash} = e.data
            const  hashProgress = Number(progress.toFixed(2))
            if(hash){
              resolve({ hash,hashProgress})
            }
        }
    })
}
