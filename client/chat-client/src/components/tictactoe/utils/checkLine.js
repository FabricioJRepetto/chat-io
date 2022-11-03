export const checkLine = (moves) => {
    const { A, B, C } = moves
    let aux = {
        left: '0'
    }

    if (A.length === 3 || B.length === 3 || C.length === 3) {
        aux.animation = 'hLine .3s ease'
        aux.height = '12px'
        aux.width = '100%'

        if (A.length === 3) {
            aux.top = 'calc(17% - 6px)'
        } else if (B.length === 3) {
            aux.top = 'calc(50% - 6px)'
        } else if (C.length === 3) {
            aux.top = 'calc(83% - 6px)'
        }
        console.log('Horizontal win!')
        return aux
    } else if (A.includes(0) && B.includes(1) && C.includes(2)) {
        console.log('Diagonal 1 win!')
        return {
            top: '50%',
            transform: 'rotate(45deg)',
            height: '12px',
            width: '100%',
            animation: 'dLine .3s ease'
        }
    } else if (A.includes(2) && B.includes(1) && C.includes(0)) {
        console.log('Diagonal 2 win!')
        return {
            top: '50%',
            transform: 'rotate(315deg)',
            height: '12px',
            width: '100%',
            animation: 'dLine .3s ease'
        }
    } else {
        for (let i = 0; i < 3; i++) {
            if (A.includes(i) && B.includes(i) && C.includes(i)) {
                aux.animation = 'vLine .3s ease'
                aux.width = '12px'
                aux.height = '100%'
                aux.left = `calc(${i === 0 ? '16.7%' : i === 1 ? '50%' : '83.5%'} - 6px)`

                console.log(`Vertical ${i} win!`)
                return aux
            }
        }
    }
    return false
}