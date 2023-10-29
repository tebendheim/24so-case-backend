const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", async (req, res) => {
  const q = `SELECT INITCAP(e.name) AS EventName, INITCAP(a.name) as AttendeeName, a.phone AS phone
    FROM participate AS p 
    JOIN event AS e ON (p.event_id = e.id) 
    JOIN attendee AS a ON (p.attendee_id = a.id)`;

  const data = await db.any(q);
  res.status(200).json(data);
});

router.post("/", async (req, res) => {
  const { name, phone, age, event } = req.body;
  try {
    const ev = await db.one("SELECT id FROM event WHERE name=LOWER($1)", [
      event,
    ]);
    const at = await db.one(
      "SELECT id FROM attendee WHERE name=LOWER($1) AND phone=$2",
      [name, phone]
    );

    await db.none(
      "INSERT INTO participate (event_id, attendee_id) VALUES ($1, $2)",
      [ev.id, at.id]
    );
    const q = `SELECT INITCAP(e.name) AS EventName, INITCAP(a.name) as AttendeeName
                    FROM participate AS p 
                    JOIN event AS e ON (p.event_id = e.id) 
                    JOIN attendee AS a ON (p.attendee_id = a.id)`;

    const data = await db.any(q);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

router.post("/all", async (req, res) => {
  const { name, phone, age, event } = req.body;
  try {
    let eventID = null;
    let attendeeID = null;
    const confEvent = await db.oneOrNone(
      "INSERT INTO event (name) VALUES (LOWER($1)) ON CONFLICT (name) DO NOTHING RETURNING id",
      [event]
    );
    if (confEvent === null) {
      const ev = await db.one("SELECT id FROM event WHERE name=(LOWER($1))", [
        event,
      ]);
      eventID = ev.id;
    } else eventID = confEvent.id;

    console.log(eventID);
    const confPart = await db.oneOrNone(
      "INSERT INTO attendee (name, phone, age) VALUES ((LOWER($1)), $2, $3) ON CONFLICT DO NOTHING RETURNING id",
      [name, phone, age]
    );

    if (confPart === null) {
      const at = await db.one(
        "SELECT id FROM attendee WHERE name=$1 AND phone=$2",
        [name, phone]
      );
      attendeeID = at.id;
    } else attendeeID = confPart.id;
    console.log(attendeeID);

    await db.none(
      "INSERT INTO participate (event_id, attendee_id) VALUES ($1, $2)",
      [eventID, attendeeID]
    );
    const q = `SELECT INITCAP(e.name) AS EventName, INITCAP(a.name) as AttendeeName
                    FROM participate AS p 
                    JOIN event AS e ON (p.event_id = e.id) 
                    JOIN attendee AS a ON (p.attendee_id = a.id)`;

    const data = await db.any(q);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

router.post("/delete", async (req, res) => {
  const { name, event, phone } = req.body;
  try {
    const q = `WITH s as
                (SELECT p.event_id AS e_id, p.attendee_id AS a_id
                FROM participate AS p 
                JOIN event AS e ON (p.event_id = e.id) 
                JOIN attendee AS a ON (p.attendee_id = a.id)
                WHERE a.name=LOWER($1) AND e.name=LOWER($2) AND a.phone=$3)
            DELETE FROM participate WHERE attendee_id=(SELECT a_id FROM s) AND event_id=(SELECT e_id FROM s)`;

    const data = await db.any(q, [name, event, phone]);
    // console.log(data)
    // await db.none('DELETE FROM attendee WHERE attendee_id=$1 AND event_id=$2', [data.a_id, data.e_id]);
    const result =
      await db.any(`SELECT INITCAP(e.name) AS EventName, INITCAP(a.name) AS event_name
                                    FROM participate AS p 
                                    JOIN event AS e ON (p.event_id = e.id) 
                                    JOIN attendee AS a ON (p.attendee_id = a.id)`);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: err });
  }
});

router.post("/add/:id", async (req, res) => {
  const { name, phone, age } = req.body;
  console.log(`${name} ${phone} ${age}`);
  try {
    const eventID = req.params.id;
    let attendeeID = null;

    console.log(`Event ID: ${eventID}`);
    const confPart = await db.oneOrNone(
      "INSERT INTO attendee (name, phone, age) VALUES ((LOWER($1)), $2, $3) ON CONFLICT DO NOTHING RETURNING id",
      [name, phone, age]
    );

    if (confPart === null) {
      const at = await db.one(
        "SELECT id FROM attendee WHERE name=LOWER($1) AND phone=$2",
        [name, phone]
      );
      attendeeID = at.id;
    } else attendeeID = confPart.id;

    console.log(`Attendee ID: ${attendeeID}`);

    await db.none(
      "INSERT INTO participate (event_id, attendee_id) VALUES ($1, $2)",
      [eventID, attendeeID]
    );
    const q = `SELECT INITCAP(e.name) AS EventName, INITCAP(a.name) as AttendeeName
                      FROM participate AS p 
                      JOIN event AS e ON (p.event_id = e.id) 
                      JOIN attendee AS a ON (p.attendee_id = a.id)`;

    const data = await db.any(q);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    if (
      err.message.includes("duplicate key value violates unique constraint")
    ) {
      res.status(409).json({ err: err });
    } else {
      res.status(500).json({ err: err });
    }
  }
});

router.get("/:eventid", async (req, res) => {
  const eventid = req.params.eventid;
  try {
    const q = `
        SELECT a.id AS id, INITCAP(a.name) as name, a.phone AS phone, a.age AS age, INITCAP(e.name) AS event_name
        FROM participate AS p 
        JOIN event AS e ON (p.event_id = e.id) 
        JOIN attendee AS a ON (p.attendee_id = a.id)
        WHERE e.id=$1`;

    const data = await db.any(q, [eventid]);
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

module.exports = router;
