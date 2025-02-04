import * as mysql from 'mysql2/promise';
import 'dotenv/config';

const HOST: string = process.env.DB_HOST!;
const PORT: string = process.env.DB_PORT!;      
const USER: string = process.env.DB_USER!;
const PASSWORD: string = process.env.DB_PASSWORD!;
const DATABASE: string = 'cats_api';

const connectionString = `mysql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`;

if (!HOST) {
  throw new Error('Environment variable HOST is not defined');
}

if (!PORT) {
  throw new Error('Environment variable PORT is not defined');
}

if (!USER) {
  throw new Error('Environment variable USER is not defined');
}

if (!PASSWORD) {
  throw new Error('Environment variable PASSWORD is not defined');
}

interface CreateCatParams {
  cat_name: string;
  breed: string;
  age: number;
}

// Function to create a new cat
async function create({ cat_name, breed, age }: CreateCatParams) {
  let conn = null;
  try {
    conn = await mysql.createConnection(connectionString);
    console.log('Connected to database'); 
    const [results]: [mysql.ResultSetHeader, mysql.FieldPacket[]] = await conn.execute(
      'INSERT INTO cats (cat_name, breed, age) VALUES (?, ?, ?)',
      [cat_name, breed, age]
    );
    console.log(`Inserted cat with ID: ${results.insertId}`); 
    return results.insertId;
  } catch (err) {
    console.error('ERROR', err); 
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}


/*
(async () => {
  const params = {
    cat_name: 'Wiskers',
    breed: 'Siam',
    age: 19
  };

  try {
    const newCatId = await create(params);
    console.log(`New cat created with ID: ${newCatId}`);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
*/

interface GetAgeParams {
  cat_name: string;
  breed: string;
}

async function getAge({ cat_name, breed }: GetAgeParams): Promise<number | null> {
  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(connectionString);
    const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await conn.execute(
      'SELECT age FROM cats WHERE cat_name = ? AND breed = ?',
      [cat_name, breed]
    );

    if (rows.length > 0) {
      return rows[0].age;
    } else {
      return null;
    }
  } catch (err) {
    console.error('ERROR', err);
    throw err;
  } finally {
    if (conn) await conn.end(); 
}
}

/*
(async () => {
  try {
    const params = { cat_name: 'Wiskers', breed: 'Siam' }; // Example parameters
    const age = await getAge(params); // Call the function to get the age of the cat
    console.log(`The age of ${params.cat_name} is ${age}.`);
  } catch (err) {
    console.error('An error occurred:', err);
  }
})().catch(console.error); 

*/




export { create, getAge };
