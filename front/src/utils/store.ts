
const store = {
    setItem: (key: string, value: any) => {
        if (key) {
            localStorage.setItem(key, JSON.stringify(value))
        }

    },
    getItem: (key: string) => {
        let value = localStorage.getItem(key);
        if (value) {
            value = JSON.parse(value)
        } else {
            value = ""
        }
        return value
    },
    remove: (key: string) => {
        localStorage.removeItem(key)
    },
    clear: () => {
        localStorage.clear()
    }
}

export default store;