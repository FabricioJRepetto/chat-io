export const botPlays = (tiles) => {
    let i = Math.floor(Math.random() * (tiles.length - 1))
    i < 0 && (i = 0)
    return tiles[i]
}