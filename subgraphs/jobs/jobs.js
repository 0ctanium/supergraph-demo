// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'jobs',
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

const jobs = [
  { _id: '1', createdAt: '6/25/2021', author: '1' },
  { _id: '2', createdAt: '4/11/2021', author: '1' },
]

const typeDefs = gql(readFileSync('./jobs.graphql', { encoding: 'utf-8' }));
const resolvers = {
  // Entity
  Job: {
    __resolveReference: (reference) => {
      console.log('jobs.Job.__resolveReference', reference)
      if (reference._id) return products.find(p => p._id == reference._id);
    }
  },

  // Extends
  Employer: {
    jobs: (reference) => {
      console.log('jobs.Employer.jobs', reference)
      if(reference._id) return jobs.filter(j => j.author == reference._id)
    },
    user: (reference) => {
      console.log('jobs.Employer.user', reference)
        if(reference.author) return { __typename: "User", _id: reference.author }
    }
  }
}

const server = new ApolloServer({ schema: buildFederatedSchema({ typeDefs, resolvers }) });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Inventory subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
