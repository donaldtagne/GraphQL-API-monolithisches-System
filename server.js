
/* Importieren der benötigten Module */
const { ApolloServer, gql } = require('apollo-server');
const db = require('./datenbank.js');
const mysql2 = require('mysql2');

/* Bestimmung des Schemas mit GraphQL-Typen */
const typeDefs = gql`
  type Customer {
    C_id: Int!
    C_UNAME: String!
    C_PASSWD: String!
    C_FNAME: String!
    C_LNAME: String!
    C_ADDR_ID: String!
    C_EMAIL: String!
    C_SINCE: Float
    C_LAST_LOGIN: String!
    C_LOGIN:String!
    C_EXPIRATION: String!
    C_DISCOUNT: Float!
    C_BALANCE: Float!
    C_YTD_PMT: Float!
    C_BIRTHDATE: String!
  }

  type Query {
    customers: [Customer] # Abfrage zum Abrufen aller Customer
  }
  type Mutation {
    addCustomers(numCustomers: Int!): AddCustomersResponse! # Mutation zum Hinzufügen einer bestimmten Anzahl von Kunden
  }

  type AddCustomersResponse {
    insertedCustomers: Int! # Anzahl der erfolgreich eingefügten Kunden
  }
`;
function generateCustomers(numCustomers) {
  return new Promise((resolve, reject) => {
    /*Abrufen der höchsten ID aus der Kundentabelle, um eindeutige IDs für die neuen Einträge zu generieren*/
    db.query('SELECT * FROM customer', (err, result) => {
      if (err) {
        reject(err);
      } else {
        /*Generieren der Kundeneinträge basierend auf der bereitgestellten Nummer und der maximalen ID*/
        const customers = [];
        for(let i = 1; i <= numCustomers; i++) { /*Hier werden einige zufällige Daten für die Kunden generiert*/
          const id = i;
          const user = `user${id}`;
          const password = `password${id}`;
          const firstName = `First${id}`;
          const lastName = `Last${id}`;
          const address = `address${id}`;
          const email = `${user}@example.com`;
          const c_since = 1 + (i * 0.1);
          const last_login = `2022-06-${String((i % 30) + 1).padStart(2, '0')}`;;
          const login = user;
          const expiration = `2023-06-${String((i % 30) + 1).padStart(2, '0')}`;
          const discount = (i * 0.1).toFixed(1);
          const balance = String(i * 100);
          const ytd_pmt = String(i * 1000);
          const birthdate = `1990-${String((i % 12) + 1).padStart(2, '0')}-10`;
          customers.push([id, user, password, firstName, lastName, address, email, c_since, last_login, login, expiration, discount, balance, ytd_pmt, birthdate]);
        }
        resolve(customers); /*Die generierten Kunden werden zurückgegeben*/
      }
    });
  });
}
/* Definieren der Resolver-Funktionen für die Abfragen */
const resolvers = {
  Query: {
    customers: () => {
      return new Promise((resolve, reject) => {
        /* Abrufen aller Customers aus der Datenbank */
        console.time("Database Query"); /*Start der Zeitmessung*/
        db.query('SELECT * FROM customer', (err, rows) => {
          console.timeEnd("Database Query"); /*Endezeit der Messung*/
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
  },
  Mutation: {
    addCustomers: (_, { numCustomers }) => {
      return new Promise(async (resolve, reject) => {
        /* Löschen aller Einträge aus der Tabelle 'customer' */
        db.query('DELETE FROM customer', async (err) => {
          if (err) {
            reject(err);
          } else {
            try {
              /* Generiert customers */
              const customers = await generateCustomers(numCustomers);
        
              /* Build SQL query */
              const insertQuery = `
                INSERT INTO customer (C_id, C_UNAME, C_PASSWD, C_FNAME, C_LNAME, C_ADDR_ID, C_EMAIL, C_SINCE, C_LAST_LOGIN, C_LOGIN, C_EXPIRATION, C_DISCOUNT, C_BALANCE, C_YTD_PMT, C_BIRTHDATE)
                VALUES ?
              `;
        
              /* Fügt neue customers in der datenbank */
              console.time("Database Query"); /* Start der Zeitmessung */
              db.query(insertQuery, [customers], (err, result) => {
                console.timeEnd("Database Query");
                if (err) {
                  reject(err);
                } else {
                  /* Return the number of inserted customers */
                  resolve({ insertedCustomers: numCustomers });
                }
              });
            } catch (err) {
              reject(err);
            }
          }
        });
      });
    },
  }

}

/* Erstellen und Starten des Apollo Servers mit den definierten Typen und Resolvers */
const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 5000}).then(({ url }) => {
  console.log(`GraphQL server running at ${url}`);
});