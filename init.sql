create table attendee(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone INTEGER UNIQUE NOT NULL, 
    age INTEGER
);


create table event(
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

create table participate(
    id SERIAL PRIMARY KEY,
    attendee_id INT,
    event_id INT,
    FOREIGN KEY (attendee_id) REFERENCES attendee (id),
    FOREIGN KEY (event_id) REFERENCES event(id),
    CONSTRAINT unique_attendee_event UNIQUE (attendee_id, event_id)
);


INSERT INTO event (name) 
    VALUES
        ('Scandinavian Open WCS'),
        ('Winter White WCS'),
        ('Norway Westie Fest');



--For å fjerne alt og starte på nytt, så må det gjøres slik:
DROP TABLE participate;
DROP TABLE event;
DROP TABLE attendee