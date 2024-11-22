export const notFound = (req, res) => {
    res.status(404).json({ message: "The requested route does not exist" })
}