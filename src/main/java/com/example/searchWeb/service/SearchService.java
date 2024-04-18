package com.example.searchWeb.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFormatter;
import org.springframework.stereotype.Service;

@Service
public class SearchService {
	public String search(String uri) {
		StringBuffer sb = new StringBuffer();
		sb.append("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n");
		sb.append("PREFIX owl: <http://www.w3.org/2002/07/owl#>\n");
		sb.append("prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n");
		sb.append("prefix nlon: <http://lod.nl.go.kr/ontology/>\n");
		sb.append("select * where { \n");
		sb.append("?s rdfs:label '" + uri + "' . \n");
		sb.append("?s rdf:type nlon:Author . \n");
		sb.append("	optional { ?s nlon:birthYear ?birthYear } \n");
		sb.append(" optional { ?s <http://schema.org/birthPlace> ?birthPlace } \n");
		sb.append(" optional { ?s nlon:fieldOfActivity ?fieldOfActivity } \n");
		sb.append("	optional { ?s <http://schema.org/jobTitle> ?jobTitle } \n");
		sb.append("	optional { ?s owl:sameAs ?sameas } \n");
		sb.append("}  order by ?s \n");

		String service = "https://lod.nl.go.kr/sparql";
		Query query = QueryFactory.create(sb.toString());
		QueryExecution qexec = null;
		ResultSet rs = null;
		ByteArrayOutputStream outputStream = null;
		try {
			qexec = QueryExecutionFactory.sparqlService(service, query);
			rs = qexec.execSelect();

			outputStream = new ByteArrayOutputStream();
			ResultSetFormatter.outputAsJSON(outputStream, rs);
			outputStream.toByteArray();
			return new String(outputStream.toByteArray());
		} finally {
			if (outputStream != null) {
				try {
					outputStream.close();
				} catch (IOException e) {// ignore
				}
			}
			if (qexec != null) {
				qexec.close();
			}
		}
	}

}
