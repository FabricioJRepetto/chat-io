export const checkLine = (moves) => {
    const { A, B, C } = moves
    if (A.length === 3 || B.length === 3 || C.length === 3) {
        console.log('Horizontal win!')
        return 'Horizontal win!'
    } else if (A.includes(0) && B.includes(1) && C.includes(2)) {
        console.log('Diagonal win!')
        return 'Diagonal win!'
    } else if (A.includes(2) && B.includes(1) && C.includes(0)) {
        console.log('Diagonal win!')
        return 'Diagonal win!'
    } else {
        for (let i = 0; i < 3; i++) {
            if (A.includes(i) && B.includes(i) && C.includes(i)) {
                console.log('Vertical win!')
                return 'Vertical win!'
            }
        }
    }
    return false
}