const fs = require('fs');
const path = require('path');

const data = {
    'Fiat': ['Panda', 'Idea', 'Tipo', 'Doblo', '500', '600', 'Freemont', 'Multipla', 'Qubo', 'Punto', 'Bravo'],
    'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Up!', 'Touareg'],
    'Toyota': ['Yaris', 'Corolla', 'Aygo', 'RAV4', 'C-HR'],
    'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Ecosport'],
    'Peugeot': ['208', '2008', '308', '3008', '5008'],
    'Citroen': ['C3', 'C3 Aircross', 'C4', 'C5 Aircross', 'Berlingo'],
    'Jeep': ['Renegade', 'Compass', 'Avenger', 'Wrangler', 'Grand Cherokee'],
    'Suzuki': ['Swift', 'Ignis', 'Vitara', 'S-Cross', 'Jimny'],
    'Honda': ['Civic', 'Jazz', 'HR-V', 'CR-V'],
    'Audi': ['A1', 'A3', 'A4', 'Q2', 'Q3', 'Q5'],
    'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
    'Mercedes': ['Classe A', 'Classe C', 'GLA', 'GLC', 'Vito'],
    'BMW': ['Serie 1', 'Serie 3', 'X1', 'X3', 'X5'],
    'Renault': ['Clio', 'Captur', 'Megane', 'Kadjar', 'Kangoo'],
    'Opel': ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland'],
    'Alfa Romeo': ['Giulietta', 'Giulia', 'Stelvio', 'Tonale']
};

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

const vehicles = [];
const baseDir = 'c:/Users/thoma/Documents/Mechanic-Workshop-Management-Web-App-main/public';
const assetsDir = path.join(baseDir, 'assets');
const logosDir = path.join(assetsDir, 'logos');
const carsDir = path.join(assetsDir, 'cars');

// Creazione cartelle
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });
if (!fs.existsSync(carsDir)) fs.mkdirSync(carsDir, { recursive: true });

for (const [brand, models] of Object.entries(data)) {
    const brandSlug = slugify(brand);
    const brandDir = path.join(carsDir, brandSlug);
    if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });

    for (const model of models) {
        const modelSlug = slugify(model);

        let urlBrand = encodeURIComponent(brand);
        let urlModel = encodeURIComponent(model);

        vehicles.push({
            brand: brand,
            brandSlug: brandSlug,
            model: model,
            modelSlug: modelSlug,
            // "year": "latest",
            imagePath: `/assets/cars/${brandSlug}/${modelSlug}.png`,
            logoPath: `/assets/logos/${brandSlug}.png`,
            sourcePage: `https://duckduckgo.com/?q=${urlBrand}+${urlModel}+side+profile+car+png+transparent&iax=images&ia=images`,
            needsManualDownload: true
        });
    }
}

const jsonPath = path.join(baseDir, 'vehicles.json');
fs.writeFileSync(jsonPath, JSON.stringify(vehicles, null, 2));

console.log("Cartelle e file JSON creati con successo in public/!");
