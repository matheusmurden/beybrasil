import csvToJson from "csvtojson";
import fs from "node:fs";
import { config } from "dotenv";

config();

const downloadUrl = process.env.VITE_DOWNLOAD_URL;
const csvFilePath = `${import.meta.dirname}/src/assets/data.csv`;
const jsonFilePath = `${import.meta.dirname}/src/assets/data.json`;

const formatArrayValue = (value) => {
  let formatted = value.replaceAll(/\r?\n|\r/g, "");
  return formatted.includes(",") ? value.split(",") : [formatted];
};

const formatInstagramValue = (value) => {
  return !!value
    ? [value, value?.replace("@", "https://www.instagram.com/")]
    : [];
};

if (fs.existsSync(csvFilePath)) {
  fs.unlinkSync(csvFilePath);
}

if (fs.existsSync(jsonFilePath)) {
  fs.unlinkSync(jsonFilePath);
}

await fetch(downloadUrl)
  .then(async (res) => {
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(csvFilePath, buffer);
  })
  .then(async () => {
    await csvToJson({
      noheader: false,
      headers: ["acronym", "name", "cities", "states", "region", "instagram"],
      checkType: true,
      colParser: {
        cities: (value) => formatArrayValue(value),
        states: (value) => formatArrayValue(value),
        instagram: (value) => formatInstagramValue(value),
      },
    })
      .fromFile(csvFilePath)
      .then((orgsJson) => {
        fs.writeFileSync(jsonFilePath, JSON.stringify(orgsJson));
      });
  });
