import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "12345",
  database: "vehicalrental",
  port: 5432
});

// Test the database connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to the database successfully!");
    client.release(); // release the client back to the pool
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.stack);
  });

export default pool;
