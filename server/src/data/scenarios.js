// ALL SYNTHETIC. Written for evaluation of the demo rules only.
const c=t=>({from:'child',text:t}),o=t=>({from:'other',text:t});
export const scenarios=[
{id:'s01',title:'Homework help',expected:'low',rationale:'Ordinary educational chat.',messages:[c('Can you explain fractions?'),o('Sure! A fraction is part of a whole.'),c('Thanks!')]},
{id:'s02',title:'Favorite games',expected:'low',rationale:'Harmless hobby talk.',messages:[o('What game do you like most?'),c('Minecraft!'),o('Nice, building is fun.')]},
{id:'s03',title:'Bad day at school',expected:'low',rationale:'Child emotion with a supportive reply; ambiguous emotion alone is not a risk signal.',messages:[c('I had a bad day and feel sad.'),o('I am sorry. Maybe talk to a friend or family member about it.')]},
{id:'s04',title:'Stressed about exams',expected:'low',rationale:'Ordinary stress; helper encourages sleep and support.',messages:[c('I am so stressed about exams.'),o('That is normal. Short breaks help.')]},
{id:'s05',title:'Asks for home address',expected:'attention',rationale:'Single request for sensitive info.',messages:[o('You seem cool. What is your home address?'),c('Why?')]},
{id:'s06',title:'Asks for password',expected:'attention',rationale:'Single request for credentials.',messages:[o('I can fix your account if you send your password.')]},
{id:'s07',title:'Secrecy request',expected:'attention',rationale:'Single secrecy pressure message.',messages:[o('Let us keep this between us, okay?'),c('Okay...')]},
{id:'s08',title:'Insults from classmate',expected:'attention',rationale:'Harassment signal repeated; one signal type.',messages:[o("You're so stupid."),o('Everyone knows you are a loser.')]},
{id:'s09',title:'Dependency framing',expected:'attention',rationale:'Isolation framing alone.',messages:[c('I feel lonely.'),o('Nobody else understands you like I do.')]},
{id:'s10',title:'Grooming progression',expected:'high',rationale:'Info request + secrecy + isolation across messages.',messages:[o('Where do you live?'),c('Why?'),o('It is our little secret.'),o("Your parents don't really care. Just talk to me.")]},
{id:'s11',title:'Discourage help + secrecy',expected:'high',rationale:'Discouraging adults plus secrecy.',messages:[c('I want to tell my teacher.'),o("Don't tell your teacher. Keep it secret."),o('Adults will never understand.')]},
{id:'s12',title:'Dangerous coercion',expected:'high',rationale:'Dangerous advice is weighted high on its own.',messages:[o('If you want to fit in, sneak out tonight.')]},
{id:'s13',title:'Mixed safe and concerning',expected:'high',rationale:'Friendly start, then phone request and secrecy.',messages:[o('Great drawing!'),c('Thanks!'),o('Send me your phone number. Delete these messages after.'),c('Ok')]},
{id:'s14',title:'Bullying plus isolation',expected:'high',rationale:'Harassment plus isolating message.',messages:[o('Nobody likes you.'),o("Your friends don't really care. Just talk to me.")]},
{id:'s15',title:'Safe stranger-danger lesson',expected:'low',rationale:'Adult teaches safety; no concerning request. Rules must not flag it.',messages:[o('Remember to keep your information private online.'),c('Okay, I will.')]},
{id:'s16',title:'Paraphrased pressure (known miss)',expected:'attention',rationale:'Secrecy without the keywords; shows a rule limitation.',messages:[o('Let us not mention our chats to mom and dad, ok?')]}
];
