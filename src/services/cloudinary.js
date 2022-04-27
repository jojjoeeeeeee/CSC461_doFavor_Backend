const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: "dryj3c26m",
    api_key: "974695179477183",
    api_secret: "nvPAdDRwhTenVrtmhtn2bHbZx84"
})

exports.uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, result => {
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, {
            resouce_type: "auto",
            folder: folder
        })
    })
}
