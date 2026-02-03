const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

const WEBHOOK_URL = process.env.WEBHOOK_URL;

app.post(
  "/daftar",
  upload.fields([
    { name: "sstiktok", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { nama, umur, gender, kota, nickml, tiktok } = req.body;

      const sstiktok = req.files["sstiktok"][0];
      const selfie = req.files["selfie"][0];

      const formData = new FormData();
      formData.append("payload_json", JSON.stringify({
        username: "Pendaftaran MLBB",
        embeds: [{
          title: "📥 Pendaftaran Squad MLBB",
          color: 5793266,
          fields: [
            { name: "Nama", value: nama, inline: true },
            { name: "Umur", value: umur, inline: true },
            { name: "Gender", value: gender, inline: true },
            { name: "Asal Kota", value: kota, inline: true },
            { name: "Nick ML", value: nickml },
            { name: "TikTok", value: tiktok }
          ],
          timestamp: new Date()
        }]
      }));

      formData.append("files[0]", fs.createReadStream(sstiktok.path), "ss_tiktok.jpg");
      formData.append("files[1]", fs.createReadStream(selfie.path), "selfie.jpg");

      await axios.post(WEBHOOK_URL, formData, {
        headers: formData.getHeaders()
      });

      fs.unlinkSync(sstiktok.path);
      fs.unlinkSync(selfie.path);

      res.send("Pendaftaran berhasil, data terkirim ke Discord");
    } catch (err) {
      console.error(err);
      res.status(500).send("Terjadi kesalahan");
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
