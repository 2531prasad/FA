export const groupName = report => report?.query || report?.company || '';
export const groupKey = report => report?.query ? `query:${report.query}` : `company:${report?.company || ''}`;
export const groupCode = report => report?.query ? 'QUERY' : report?.ticker || '';
