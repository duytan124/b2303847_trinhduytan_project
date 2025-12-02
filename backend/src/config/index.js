const config = {
    src: {
        port: process.env.PORT || 3000,
    },
    db: {
        uri: process.env.MONGODB_URL || "mongodb://localhost:27017/ebookshelf"
    },
};

export default config;