// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'users',
    exporter: {
      type: process.env.APOLLO_OTEL_EXPORTER_TYPE, // console, zipkin, collector
      host: process.env.APOLLO_OTEL_EXPORTER_HOST,
      port: process.env.APOLLO_OTEL_EXPORTER_PORT,
    }
  }).setupInstrumentation();
}

const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const { readFileSync } = require('fs');

const port = process.env.APOLLO_PORT || 4000;

const users = [
  {
    _id: '1',
    name: "Jimmy",
    email: "jimmy@jsandco.fr",
    skills: ["coding", "powerpoint", "trolling"],
    roles: ["employer"]
  },
  {
    _id: '2',
    name: "Ben",
    email: "ben@jsandco.fr",
    skills: ["coding", "number 2", "next"],
    roles: ["applicant"]
  },
  {
    _id: '3',
    name: "David",
    email: "doudou@jsandco.fr",
    skills: ["coding", "bitsys", "joking"],
    roles: ["applicant"]
  }
]

const typeDefs = gql(readFileSync('./users.graphql', { encoding: 'utf-8' }));

const __resolveReference = (reference) => {
  console.log('users.Applicant.__resolveReference', reference)
  if(reference._id) return users.find(u => u._id == reference._id);
}

const resolvers = {
  Query: {
    allUsers: (_, args, context) => {
        return users;
    },
    user: (_, args, context) => {
        return users.find(p => p._id == args.id);
    }
  },

  // Entity
  User: {
      __resolveReference,
      __resolveType(obj, context, info) {
          console.log('users.User.__resolveType', obj)
          if(!obj.roles) return null

          if(obj.roles.includes('employer')) return 'Employer'
          if(obj.roles.includes('applicant')) return 'Applicant'

          return null;
      }   
  },
  Applicant: { __resolveReference },
  Employer: { __resolveReference }
}

const server = new ApolloServer({ schema: buildFederatedSchema({ typeDefs, resolvers }) });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Users subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
