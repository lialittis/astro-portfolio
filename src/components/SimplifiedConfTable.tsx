import React from "react";
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

interface TimelineEntry {
  deadline: string;
  comment: string;
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
  latestconf: ConferenceYear;
}

// const conferences: Conference[] = [
//   {
//     title: 'S&P',
//     description: 'IEEE Symposium on Security and Privacy',
//     sub: 'SC',
//     rank: { ccf: 'A', core: 'A*', thcpl: 'A' },
//     dblp: 'sp',
//     confs: [
//       {
//         year: 2023,
//         id: 'sp23',
//         link: 'https://www.ieee-security.org/TC/SP2023/',
//         timeline: [
//           { deadline: '2022-04-01 23:59:59', comment: 'First Paper submission deadline' },
//           { deadline: '2022-08-19 23:59:59', comment: 'Second Paper submission deadline' },
//           { deadline: '2022-12-02 23:59:59', comment: 'Third Paper submission deadline' }
//         ],
//         timezone: 'UTC-12',
//         date: 'May 22-26, 2023',
//         place: 'SAN FRANCISCO, CA'
//       }
//     ]
//   }
// ];

const loadConferences = (baseDir: string): Conference[] => {
  const conferenceList: Conference[] = [];

  // Read all subdirectories (e.g., security, system)
  const categories = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory()) // Only directories
    .map(dirent => dirent.name);

  categories.forEach(category => {
    const categoryPath = path.join(baseDir, category);

    // Read all YAML files inside each category
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf8');

      try {
        const parsed = yaml.parse(content);
        // console.log("Parsed YAML:", parsed);

        // Ensure the parsed data is structured correctly
        if (parsed && typeof parsed === 'object' && parsed.confs) {
          parsed.latestconf = parsed.confs[parsed.confs.length - 1];
          console.log(parsed.latestconf)
          conferenceList.push(parsed);
        } else {
          console.warn(`Warning: Skipping ${file} due to invalid structure`);
        }
      } catch (error) {
        console.error(`Error parsing YAML file ${filePath}:`, error);
      }
    });
  });

  return conferenceList;
};

// Example usage
const conferences = loadConferences('./conferences');
console.log(conferences);

const ConferenceTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300 text-white">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-200">Title</th>
            <th className="border p-2 bg-gray-200">Sub</th>
            <th className="border p-2 bg-gray-200">Rank (CCF)</th>
            <th className="border p-2 bg-gray-200">Date</th>
            <th className="border p-2 bg-gray-200">Place</th>
          </tr>
        </thead>
        <tbody>
          {conferences.map((conf) =>
              <tr className="border">
                <td className="border p-2">{conf.title}</td>
                <td className="border p-2">{conf.sub}</td>
                <td className="border p-2">{conf.rank.ccf}</td>
                <td className="border p-2">{conf.latestconf.date}</td>
                <td className="border p-2">{conf.latestconf.place}</td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConferenceTable;