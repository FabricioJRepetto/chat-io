

const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

export const animate = (star) => {
    star.style.setProperty("--star-left", `${random(-10, 100)}%`)
    star.style.setProperty("--star-top", `${random(-40, 80)}%`)

    // DOM reflow
    star.style.animation = "none"
    // star.offsetHeight
    console.log(star.offsetHeight)
    star.style.animation = ""
}