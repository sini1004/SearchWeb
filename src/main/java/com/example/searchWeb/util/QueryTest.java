package com.example.searchWeb.util;

import com.list.ontobase.client.query.SparqlQuery;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.sparql.resultset.SPARQLResult;

import java.io.IOException;

public class QueryTest {
	public static void main(String[] args) {
		System.out.println("start...");

		SparqlQuery sq = null;
		try {
			String ip = "172.16.0.192";
			int port = 9999;
			String serviceName = "nlk";
			
			sq = new SparqlQuery(ip, port, serviceName);

			String query = "prefix foaf: <http://xmlns.com/foaf/0.1/> ";
			query += "select ?s ?p ?o where { ?s foaf:name \"김영미\" . ?s ?p ?o } order by ?s";
			SPARQLResult result = sq.execute(query);

			if (result == null) {
				throw new Exception("Error: SPARQLResult is null");
			}

			int count = 0;
			ResultSet rs = result.getResultSet();
			while (rs.hasNext()) {
				QuerySolution rb = rs.nextSolution();
				String s = rb.get("?s").toString();
				String p = rb.get("?p").toString();
				String o = rb.get("?o").toString();

				String line = s + "\t" + p + "\t" + o;
				System.out.println(line);

				count++;
			}
			System.out.println("count=" + count);
			System.out.println("finish...");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (sq != null) {
				try {
					sq.close();
				} catch (IOException e) {
				}
			}
		}
	}
}
