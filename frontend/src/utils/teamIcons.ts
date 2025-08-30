// Team icon mapping using emoji representations
export const teamIcons: { [key: string]: string } = {
  // AFC East
  'Bills': '🦬',
  'Dolphins': '🐬', 
  'Patriots': '🏛️',
  'Jets': '✈️',
  
  // AFC North
  'Ravens': '🐦‍⬛',
  'Bengals': '🐅',
  'Browns': '🟤',
  'Steelers': '⚡',
  
  // AFC South
  'Texans': '🤠',
  'Colts': '🐴',
  'Jaguars': '🐆',
  'Titans': '⚔️',
  
  // AFC West
  'Chiefs': '🏹',
  'Chargers': '⚡',
  'Broncos': '🐎',
  'Raiders': '☠️',
  
  // NFC East
  'Eagles': '🦅',
  'Cowboys': '🤠',
  'Giants': '👨‍💼',
  'Commanders': '🏛️',
  
  // NFC North
  'Packers': '🧀',
  'Bears': '🐻',
  'Lions': '🦁',
  'Vikings': '⚔️',
  
  // NFC South
  'Saints': '😇',
  'Falcons': '🦅',
  'Panthers': '🐱',
  'Buccaneers': '🏴‍☠️',
  
  // NFC West
  'Cardinals': '🔴',
  'Rams': '🐏',
  'Seahawks': '🦅',
  '49ers': '⛏️'
};

export const getTeamIcon = (teamName: string): string => {
  return teamIcons[teamName] || '🏈';
};