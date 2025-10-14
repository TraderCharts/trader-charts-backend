import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const convertJsonToYaml = (jsonPath, yamlPath) => {
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const parsedData = JSON.parse(jsonData);
  const yamlData = YAML.stringify(parsedData);
  fs.writeFileSync(yamlPath, yamlData, 'utf8');
  console.log(`Converted ${jsonPath} to ${yamlPath}`);
};

const loadDefaultSwaggerSpecs = () => {
  // Load default specs if swagger_runtime.json does not exist
  const swaggerOfficialPath = path.resolve(__dirname, '../docs/specs/swagger_default.json');
  const swaggerOfficialV3Path = path.resolve(__dirname, '../docs/specs/swagger_default_v3.json');
  const swaggerRuntimePath = path.resolve(__dirname, '../docs/specs/swagger_runtime.json');
  const swaggerRuntimeV3Path = path.resolve(__dirname, '../docs/specs/swagger_runtime_v3.json');
  const swaggerRuntimeYamlPath = path.resolve(__dirname, '../docs/specs/swagger_runtime.yaml');
  const swaggerRuntimeV3YamlPath = path.resolve(__dirname, '../docs/specs/swagger_runtime_v3.yaml');

  if (fs.existsSync(swaggerOfficialV3Path || !fs.existsSync(swaggerRuntimeV3Path))) {
    fs.copyFileSync(swaggerOfficialPath, swaggerRuntimePath);
    fs.copyFileSync(swaggerOfficialV3Path, swaggerRuntimeV3Path);
    convertJsonToYaml(swaggerRuntimePath, swaggerRuntimeYamlPath);
    convertJsonToYaml(swaggerRuntimeV3Path, swaggerRuntimeV3YamlPath);
    console.log('Swagger oficial copied to runtime');
  }
};

export default loadDefaultSwaggerSpecs;
