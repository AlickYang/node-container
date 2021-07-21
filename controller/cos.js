const ibm = require('ibm-cos-sdk');
const dotenv = require('dotenv');
const fsPromises = require('fs').promises;
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const path = require('path');
dotenv.config({ path: '../config/.env' });

// Configuration
const cos_config = {
	endpoint: process.env.COS_ENDPOINT,
	apiKeyId: process.env.COS_API_KEY,
	ibmAuthEndpoint: process.env.COS_AUTH_ENDPOINT,
	serviceInstanceId: process.env.COS_SERVICE_CRN
};

//Init IBM COS
const cos = new ibm.S3(cos_config);

/**
 * This function downloads a file from a COS bucket and saves to util/downloads
 * Within req.body the following params are required:
 * @param {*} bucket = Bucket name of the COS that you want to access
 * @param {*} item_name = Unique key of the item you want to access from a COS bucket
 */
const cos_download = asyncHandler(async (req, res) => {
	// console.log(req);
	const { bucket, item_name } = req.body;
	try {
		const data = await get_item_from_cos({
			Bucket: bucket,
			Key: item_name
		});
		const file_path = path.join(__dirname, '/../util/downloads/', item_name);
		console.log(file_path);
		await fsPromises.writeFile(file_path, Buffer.from(data.Body).toString());
		res.status(201).json({ filePath: `file downloaded to folder: ../downloads/${item_name}` });
	} catch (err) {
		res.status(404);
		throw new Error(`File not found`);
	}
});
// Helper function for the above function, wrapped in promise
const get_item_from_cos = (params) => {
	return new Promise((resolve, reject) => {
		cos.getObject(params, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

/**
 * This function searches for a file in util/upload and uploads to specified COS bucket
 * Within req.body the following params are required:
 * @param {*} bucket The bucket that the file is to be uploaded
 * @param {*} item_name The name of the file to be given to the key
 */
const cos_upload = asyncHandler(async (req, res) => {
	const { bucket, item_name } = req.body;
	const file_path = path.join(__dirname, '/../util/uploads/', item_name);
	await fsPromises.access(file_path, fs.constants.F_OK).catch((err) => {
		throw new Error(err);
	});
	try {
		const data = await fsPromises.readFile(file_path, 'utf8');
		const params = {
			Bucket: bucket,
			Key: item_name,
			Body: data
		};
		const result = await upload_to_cos(params);
		console.log(result);
		res.status(201).json({ success: true, filepath: `File successfully uploaded to: ${result.Location}` });
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
});

// Helper function for the above function, wrapped in promise
const upload_to_cos = (params) => {
	return new Promise((resolve, reject) => {
		cos.upload(params, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

module.exports = { cos_download, cos_upload };
