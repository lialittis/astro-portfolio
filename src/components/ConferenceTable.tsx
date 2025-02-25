import React from "react";
import { useState, useEffect } from "react";

interface TimelineEntry {
  deadline: string;
  comment: string;
  date?: Date;
}

interface ConferenceYear {
  year: number;
  id: string;
  link: string;
  timeline: TimelineEntry[];
  timezone: string;
  date: string;
  place: string;
}

interface Conference {
  title: string;
  description: string;
  sub: string;
  rank: { ccf: string; core: string; thcpl: string };
  dblp: string;
  confs: ConferenceYear[];
}

const getConferences = async (): Promise<Conference[]> => {
  const response = await fetch('/api/conferences');
  return response.json();
};

const getNextDeadline = (timeline: TimelineEntry[]): TimelineEntry | undefined => {
  const now = new Date();
  return timeline
    .map((t) => ({ ...t, date: new Date(t.deadline) }))
    .filter((t) => t.date && t.date > now)
    .sort((a, b) => (a.date && b.date ? a.date.getTime() - b.date.getTime() : 0))[0];
};

const getRemainingTime = (deadline?: TimelineEntry): string => {
  if (!deadline || !deadline.date) return 'N/A';
  const now = new Date();
  const diff = deadline.date.getTime() - now.getTime();
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const ConferenceTable: React.FC = () => {
  const [sortedConfs, setSortedConfs] = useState<Conference[]>([]);
  // const [sortKey, setSortKey] = useState<keyof Conference | 'date' | 'place' | 'countdown'>('title');
  // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    getConferences().then(setSortedConfs);
  }, []);

  // useEffect(() => {
  //   const sorted = [...sortedConfs].sort((a, b) => {
  //     const aValue = (a as any)[sortKey];
  //     const bValue = (b as any)[sortKey];
  //     if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
  //     if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
  //     return 0;
  //   });
  //   setSortedConfs(sorted);
  // }, [sortKey, sortOrder]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newCountdowns: Record<string, string> = {};
  //     sortedConfs.forEach((conf) => {
  //       conf.confs.forEach((yearConf) => {
  //         const nextDeadline = getNextDeadline(yearConf.timeline);
  //         newCountdowns[yearConf.id] = getRemainingTime(nextDeadline);
  //       });
  //     });
  //     setCountdowns(newCountdowns);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [sortedConfs]);

  // const handleSort = (key: keyof Conference | 'date' | 'place' | 'countdown') => {
  //   setSortOrder(sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc');
  //   setSortKey(key);
  // };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            {['title', 'sub', 'rank.ccf', 'date', 'place', 'countdown'].map((key) => (
              <th
                key={key}
                // onClick={() => handleSort(key as keyof Conference | 'date' | 'place' | 'countdown')}
                className="cursor-pointer border p-2 bg-gray-200 hover:bg-gray-300"
              >
                {key.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedConfs.map((conf) =>
            conf.confs.map((yearConf) => (
              <tr key={yearConf.id} className="border">
                <td className="border p-2">{conf.title}</td>
                <td className="border p-2">{conf.sub}</td>
                <td className="border p-2">{conf.rank.ccf}</td>
                <td className="border p-2">{yearConf.date}</td>
                <td className="border p-2">{yearConf.place}</td>
                <td className="border p-2 font-mono text-red-500">
                  {countdowns[yearConf.id] || 'Calculating...'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConferenceTable;