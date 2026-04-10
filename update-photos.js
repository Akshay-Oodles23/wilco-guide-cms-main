#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "BUSINESS_DATA_COMPLETE.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Map of business slug to fresh Unsplash photo IDs (verified working)
const photoMap = {
	"el-paso-street-taco-company": [
		"photo-1565299585323-38d6b0865b47",
		"photo-1559827260-dc66d52bef19",
		"photo-1546069901-ba9599a7e63c",
		"photo-1540189549336-e6e99c3679fe",
	],
	"hill-country-wellness-fitness": [
		"photo-1534438327276-14e5300c3a48",
		"photo-1571902943202-507ec2618e8f",
		"photo-1534438327276-14e5300c3a48",
		"photo-1571902943202-507ec2618e8f",
	],
	"lone-star-plumbing-hvac": [
		"photo-1503387762-592deb58ef4e",
		"photo-1486262715619-4fcc3ff1f724",
		"photo-1487958449000-94f373e5b5b7",
		"photo-1487958449000-94f373e5b5b7",
	],
	"crafted-cup-coffee-house": [
		"photo-1442512595331-e89e73853f31",
		"photo-1447933601403-0c6688de566e",
		"photo-1442512595331-e89e73853f31",
		"photo-1447933601403-0c6688de566e",
	],
	"bright-futures-pediatric-dentistry": [
		"photo-1606811841689-23dfeb886841",
		"photo-1588776694971-25de3f011747",
		"photo-1576091160550-112173f31c74",
		"photo-1629909613654-28eca340245e",
	],
	"austin-street-boutique-vintage": [
		"photo-1564892560955-8d64eaf34ce0",
		"photo-1554050857-71489bda04ce",
		"photo-1556766111-a301cf4f4fe0",
		"photo-1558769132-cb1aea458c5e",
	],
	"cedar-park-family-auto-repair": [
		"photo-1486262715619-4fcc3ff1f724",
		"photo-1553882900-d5160ca3fc10",
		"photo-1489824904134-891ab64532f1",
		"photo-1487958449000-94f373e5b5b7",
	],
	"rosalies-kitchen-bar": [
		"photo-1517457373614-b7152f800fd1",
		"photo-1535632066927-ab7c9ab60908",
		"photo-1504674900941-0077a5c3ff77",
		"photo-1519671482749-fd09be7ccebf",
	],
	"liberty-hill-family-dental-care": [
		"photo-1606811841689-23dfeb886841",
		"photo-1629909613654-28eca340245e",
		"photo-1576091160550-112173f31c74",
		"photo-1588776694971-25de3f011747",
	],
	"georgetown-historical-tours-gifts": [
		"photo-1488646953014-85cb44e25828",
		"photo-1499856871957-5b8620a42d5d",
		"photo-1506905925346-21bda4d32df4",
		"photo-1501594907352-04cda38ebc29",
	],
	"wilco-tech-solutions": [
		"photo-1460925895917-adf4e4be359c",
		"photo-1517694712202-14dd9538aa97",
		"photo-1552664730-d307ca884978",
		"photo-1516321318423-f06f70d504f0",
	],
	"kalahari-resorts-conventions": [
		"photo-1496417694712-202b53ec96d1",
		"photo-1566073771259-6a8506099945",
		"photo-1505142468610-359e7d316be0",
		"photo-1520763185298-1b434c919abe",
	],
};

// Update photos for each business
let updated = 0;
data.forEach((business) => {
	if (photoMap[business.slug]) {
		business.photos = photoMap[business.slug].map(
			(id) => `https://images.unsplash.com/${id}?w=800&q=80`,
		);
		updated++;
	}
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`✅ Updated photo URLs for ${updated} businesses`);
