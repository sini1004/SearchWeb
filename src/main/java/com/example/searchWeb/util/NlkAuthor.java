package com.example.searchWeb.util;

import java.util.List;
import java.util.Map;

public class NlkAuthor {
	public String url;
	public Map<String, List<String>> props;

	@Override
	public String toString() {
		return "url=" + url + " props=" + props;
	}
}
