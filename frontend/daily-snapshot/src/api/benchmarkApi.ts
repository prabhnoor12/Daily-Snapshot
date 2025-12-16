
import { shopifyFetch, shopifyFetchJson } from './shopifyFetch';

const API_BASE = 'https://daily-snapshot-1.onrender.com/benchmarking';

  const url = `${API_BASE}/${shopId}/metrics`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/trends`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/correlation`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/segmentation`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/warnings`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/milestones`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/recommendations`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/dashboard`;
  return shopifyFetchJson(url);
}

  const url = `${API_BASE}/${shopId}/summary`;
  return shopifyFetchJson(url);
}

  const url = new URL(`${API_BASE}/${shopId}/export`);
  url.searchParams.set('format', format);
  return shopifyFetch(url.toString(), { method: 'GET' });
}
