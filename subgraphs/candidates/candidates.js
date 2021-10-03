// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'candidates',
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

const candidates = [
    { _id: '1', user: '2', job: '1' },
    { _id: '2', user: '3', job: '1' },
    { _id: '3', user: '3', job: '2' },
]
const typeDefs = gql(readFileSync('./candidates.graphql', { encoding: 'utf-8' }));
const resolvers = {
    // Entity
    Candidate: {
        __resolveReference: (reference) => {
            console.log('candidates.Candidate.__resolveReference', reference)
            if (reference._id) return candidates.find(c => c._id == reference._id);
        },
        user: (reference) => {
            console.log('candidates.Candidate.user', reference)
            if(reference.user) return { __typename: "User", _id: reference.user }
        }
    },

    // Extends
    Job: {
        candidates: (reference) => {
            console.log('candidate.Job.candidates', reference)
            if (reference._id) return candidates.filter(c => c.job == reference._id);
        }
    },
    Applicant: {
        candidates: (reference) => {
            console.log('candidate.Applicant.candidates', reference)
            if (reference._id) return candidates.filter(c => c.user == reference._id);
        }
    }
}

const server = new ApolloServer({ schema: buildFederatedSchema({ typeDefs, resolvers }) });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Products subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
