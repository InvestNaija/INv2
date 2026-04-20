import * as fs from 'fs';
import * as path from 'path';
import Converter from 'openapi-to-postmanv2';

const swaggerFilePath = path.join(__dirname, './swagger-output.json');
const outputFilePath = path.join(__dirname, '../INv2.postman_collection.json');

if (fs.existsSync(swaggerFilePath)) {
  const swaggerData = fs.readFileSync(swaggerFilePath, 'utf8');

  Converter.convert({ type: 'string', data: swaggerData }, {}, (err, status: any) => {
    if (err) {
      console.error('Error during conversion:', err);
      return;
    }
    if (!status.result || !status.output || status.output.length === 0) {
      console.error('Conversion failed or output is empty:', status.reason || 'No output data');
      return;
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(status.output[0].data, null, 2));
    console.log(`Postman collection generated successfully at ${outputFilePath}`);
  });
} else {
  console.error('Swagger output file not found. Please run "npm run docs" first.');
}
