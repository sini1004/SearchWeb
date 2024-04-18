package com.example.searchWeb.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.searchWeb.db.MySqlQueryData;

@Service
public class DbService {

	public ArrayList<String> author035_Agency() {
		MySqlQueryData msqd = new MySqlQueryData();
		try {
			return msqd.author035_Agency();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public Map<String, Map<String,String>> author035_duplication(String agency) {
		MySqlQueryData msqd = new MySqlQueryData();
		try {
			return msqd.author035_duplication(agency);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
}
