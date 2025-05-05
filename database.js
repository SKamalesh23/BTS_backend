import mysql from "mysql2";
const pool = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "kamalesh23",
    database: "BTS",
  })
  .promise();
const city = "Thanjavur";
export async function showBus(city) {
  const result = await pool.query(
    `SELECT Bus_name,start_point,end_point FROM bus_details WHERE City = ?`,
    [city]
  );
  return result[0];
}
export async function showCity() {
  const result = await pool.query(`SELECT DISTINCT City FROM bus_details`);
  return result[0];
}
export async function showStops(city) {
  const result = await pool.query(`SELECT * FROM stops WHERE City = ?`, [city]);
  console.log(result[0]);
  return result[0];
}
export async function showStartEnd(bus){
  console.log(bus);
  
  const result = await pool.query(`SELECT start_point,end_point FROM bus_details WHERE Bus_name = ?`,[bus])
  console.log("start ====> ",result[0]);
  
  return result[0];
}
export async function showPAth(city) {
  const result = await pool.query(
    `SELECT * FROM stops WHERE City = ? AND Bus_name=?`,
    [city, bus]
  );
  return result[0];
}

export async function showCorrectbus(from, to) {
  const sql = `
    SELECT Bus_id, Bus_name
    FROM stops
    WHERE stop IN (?, ?)
    GROUP BY Bus_id, Bus_name
    HAVING COUNT(DISTINCT stop) = 2;
  `;

  const [rows] = await pool.query(sql, [from, to]);
  console.log(rows);
  return rows;
}

