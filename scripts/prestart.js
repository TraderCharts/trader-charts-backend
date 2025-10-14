if (process.env.NODE_ENV !== 'production') {
    console.error("You must use 'npm run start-develop' command in a developement environment");
    process.exit(1);
}
