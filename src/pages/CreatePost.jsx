import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);

  const navigate = useNavigate();

  const handleUpdloadImage = async () => {
    if (!file) {
      setImageUploadError("Please select an image");
      return;
    }

    // Create an S3 client service object
    const s3 = new S3Client({
      region: "default",
      endpoint: "https://s3.ir-thr-at1.arvanstorage.ir",
      credentials: {
        accessKeyId: "90b1c029-f133-48b6-b32b-cae706163a12",
        secretAccessKey:
          "2a352d2de205073a01ef07fd1ab4f92ee612d703d892151c7dae4075a5daeb0b",
      }
    });


    const fileName = new Date().getTime() + file.name;
    const uploadParams = {
      Bucket: "medium-clone-storage", // bucket name
      Key: fileName, // the name of the selected file
      ACL: "public-read", // 'private' | 'public-read'
      Body: "",
    };
    const run = async () => {
      // Configure the file stream and obtain the upload parameters
      /*
      setImageUploadProgress(0);
      const fileStream = fs.createReadStream(file);
      fileStream.on("error", function (err) {
        console.log("File Error", err);
      });
      */

      //uploadParams.Key = path.basename(file);
      // call S3 to upload file to specified bucket
      const fileContent = await file.arrayBuffer();
      uploadParams.Body = fileContent;

      try {
        //const response = await s3.send(new PutBucketCorsCommand(cors));
        const data = await s3.send(new PutObjectCommand(uploadParams));
        setImageUploadProgress(100);
        //console.log("Success", data);
        setFormData({ ...formData, image: `https://s3.ir-thr-at1.arvanstorage.ir/${uploadParams.Bucket}/${fileName}` });
      } catch (err) {
        console.log("Error", err);
      }
    };

    run();

    /*
    const img_data = new FormData();
    img_data.append("file", file);
    img_data.append("upload_preset", "react-medium");
    img_data.append("cloud_name", "dsbs49gce");

    try {
      setImageUploadProgress(0);
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dsbs49gce/image/upload",
        {
          method: "POST",
          body: img_data,
        }
      );

      const result = await res.json();
      setFormData({ ...formData, image: result.secure_url });
      setImageUploadProgress(100);
      console.log("Image uploaded:", result.secure_url);
    } catch (err) {
      setImageUploadError(
        "Could not upload image (File must be less than 2MB)"
      );
      setImageUploadProgress(null);
    }
    */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_POST_SERVICE}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="Marketing">Marketing</option>
            <option value="Programming">Programming</option>
            <option value="Sports">Sports</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUpdloadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
