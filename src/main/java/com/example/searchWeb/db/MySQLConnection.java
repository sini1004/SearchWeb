package com.example.searchWeb.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MySQLConnection {

	private Connection conn;
	private static final String USERNAME = "korea";
	private static final String PASSWORD = "korea!@#$";
	private static final String IP = "172.16.0.192";
	private static final String DBNAME = "korea";

	private static final MySQLConnection instance = new MySQLConnection();

	public static MySQLConnection getInstance() {
		return instance;
	}

	/**
	 * @author Gi-hoon
	 * @return Connection
	 */
	public static Connection getMySQLConnection() {
		Connection conn = null;
		try {
			conn = DriverManager.getConnection("jdbc:mysql://172.16.0.192/korea", "korea", "korea!@#$");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return conn;
	}

}
