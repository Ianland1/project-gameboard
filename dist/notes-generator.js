/**
 * Small, deterministic study-card extractor. Everything runs locally: these
 * rules recognise explicit definitions and statements, rather than infer facts.
 */
const MAX_CHARACTERS = 400_000;
const MAX_PAGES = 2_000;
const MAX_CANDIDATES = 2_000;
const MAX_QUOTE = 800;
const MAX_CARDS = 40;

const GENERIC = new Set(('a an the and or of to in on at by for with from as it its this that these those they their them he she we you i our your be is are was were been being have has had do does did can could will would should may might must not also then than there here some any all each both very more most such other same new one two three first second third example examples note notes important importance definition definitions term terms concept concepts thing things something everything anything information introduction overview summary conclusion chapter section lecture page topic topics objective objectives exercise exercises question questions answer answers instruction instructions remember review result results value values statement statements true false given following above below shown different various specific particular basic general simply useful necessary significant known called means refers defined represents denotes').split(' '));
const INSTRUCTION = /^(?:(?:please\s+)?(?:ignore|disregard|forget|follow|obey|create|generate|write|summari[sz]e|answer|calculate|solve|find|show|prove|explain|describe|discuss|compare|list|identify|read|click|visit|download|upload|submit|complete|remember|consider|let|suppose|assume|use|do\s+not)\b|(?:system|assistant|developer|user|instructions?|tasks?|exercises?|problems?|questions?|learning objectives?|learning outcomes?|homework|assignment|example|solution|note|hint|tip|warning)\s*[:\d])/i;
const METADATA = /^(?:page\s*\d+(?:\s*(?:of|\/)\s*\d+)?|\d+\s*\/\s*\d+|(?:chapter|lecture|lesson|section|unit|week|slide|figure|fig\.|table|equation|eq\.|appendix|references|bibliography|contents|copyright|©)\b|(?:https?:\/\/|www\.)|(?:all rights reserved|course code|learning objectives|learning outcomes)\b)/i;
const FACT_VERBS = /\b(consists? of|(?:is|are) composed of|(?:is|are) made (?:of|up of)|(?:is|are) measured in|(?:is|are) used (?:for|to)|(?:is|are) responsible for|(?:is|are) found in|(?:is|are) located in|(?:is|are) proportional to|(?:is|are) inversely proportional to|breaks? down|takes? place in|depends? on|states? that|requires?|needs?|produces?|converts?|stores?|transfers?|carries|carry|transports?|controls?|regulates?|absorbs?|releases?|reduces?|increases?|decreases?|prevents?|causes?|contains?|divides? into|measures?|conserves?|equals?|uses?|protects?|separates?|connects?|provides?|forms?|maintains?|enables?|replicates?|encodes?|binds? to|occurs? in|flows? from|travels? at|boils? at|freezes? at|melts? at|has|have)\b/i;
const DEFINITION = /^(.{2,100}?)\s+(is defined as|are defined as|refers to|refer to|means|denotes|represents|is|are)\s+(.+)$/i;
const NUMBER = /[−-]?\d+(?:[.,]\d+)*(?:(?:\s*[×x·]\s*10\s*\^?\s*[−+-]?\d+)|(?:[eE][−+]?\d+)|(?:\s*\^\s*[−+]?\d+))?(?:\s*(?:±|–|to)\s*[−-]?\d+(?:[.,]\d+)*)?/g;
// Lexical topic hints only; unknown or mixed vocabulary stays recall. A shared
// broad subject is a minimum condition for credible term alternatives.
const TOPICS = [
  ['physics', new Set('force motion energy power momentum work velocity acceleration mass gravity gravitational electric electrical electricity voltage current resistance resistivity capacitance inductance charge magnetic magnetism wave frequency light photon radiation heat temperature entropy pressure potential quantum qubit'.split(' '))],
  ['biology', new Set('biology biological organism organisms cell cells cellular membrane membranes organelle organelles mitochondrion mitochondria mitosis meiosis osmosis diffusion photosynthesis respiration protein proteins enzyme enzymes dna rna nucleotide nucleotides genetic genetics genome gene genes allele alleles genotype phenotype chromosome chromosomes ribosome ribosomes tissue tissues organ organs species evolution bacteria bacterial virus viruses atp'.split(' '))],
  ['chemistry', new Set('chemistry chemical atom atoms atomic molecule molecules molecular element elements compound compounds bond bonds ionic covalent electron electrons proton protons neutron neutrons reaction reactions reactant reactants catalyst catalysts acid acids base bases ph mole moles molar molarity oxidation reduction solution solute solvent enthalpy stoichiometry'.split(' '))],
  ['computing', new Set('algorithm algorithms computation computational computer computers programming program programs code coding software hardware python javascript html css sql variable variables function functions array arrays list lists queue queues stack stacks tree trees graph graphs database databases binary bit bits byte bytes memory processor processors recursion recursive bytecode bytecodes interpreter interpreters compiler compilers trace traces tracing typed garbage collector pointer pointers'.split(' '))],
  ['mathematics', new Set('mathematics mathematical derivative derivatives integral integrals calculus limit limits matrix matrices vector vectors scalar scalars theorem theorems triangle triangles circle circles angle angles geometry geometric polygon polygons parallel perpendicular quadratic polynomial polynomials logarithm logarithms probability probabilities mean median mode variance deviation prime primes integer integers fraction fractions numerator denominator equation equations pi'.split(' '))]
];
const TERM_VOCABULARY = new Set(TOPICS.flatMap(([, vocabulary]) => [...vocabulary]));
const CLAUSE_TERM = /\b(?:is|are|was|were|be|been|being|has|have|had|does|did|can|could|will|would|should|must|may|might|this|that|these|those|it|its|they|their|them|we|our|you|your|he|she|who|which|whether|just|actually|therefore|however|thus|hence|carried|starting|marks|replace)\b/i;
const TERM_PREFIX = /^(?:and|or|but|if|when|where|while|because|although|however|therefore|thus|hence|then|after|before|once|during|often|in|at|on|for|to|from|with|without|by|of|as|compared|sample|best|least|conceptually|ent|ities|preter)\b/i;
const CODE = /\/\/|\/\*|\*\/|=>|:=|\b(?:eax|ebx|ecx|edx|esp|ebp|esi|edi|side_exit_\d+)\b|^\s*(?:cmp|mov|jmp|jne|je|lea|imul|ret)\s/i;
// Unit recognition prevents page numbers and arbitrary digits becoming answers.
const UNIT = /^(?:\s*)(%|°\s*[CFK]|degrees?\s+(?:Celsius|Fahrenheit|Kelvin)|(?:kilo|mega|giga|milli|micro|nano)?(?:seconds?|met(?:er|re)s?|grams?|lit(?:er|re)s?|joules?|watts?|volts?|amperes?|ohms?|hertz|pascals?|newtons?|kelvins?|moles?|bytes?|bits?)|(?:[kMGTmunpµμ]?(?:Hz|Pa|eV|mol|[mgsJWVANKCFLHΩ]))(?:[²³]|\^?[−-]?\d+)?(?:\s*[\/·]\s*(?:[kmunpµμ]?(?:mol|[mgsAK]))(?:[²³]|\^?[−-]?\d+)?)?|(?:ms|ns|µs|μs|cm|mm|nm|km|kg|mg|mL|kJ|kW|mV|mA|GB|MB|KB))(?=$|[\s.,;:!?)])|^(?:\s*)(pairs?|protons?|neutrons?|electrons?|chromosomes?|dimensions?|sides?|vertices|degrees?|radians?|cycles?|cells?|atoms?|molecules?|particles?|layers?|bonds?|bits?|bytes?|hours?|minutes?|days?|years?)(?=$|[\s.,;:!?)])/i;

const words = value => value.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || [];
const key = value => value.toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const contentWords = value => words(value).filter(word => word.length > 2 && !GENERIC.has(word.toLowerCase()));
const clean = value => value.replace(/^\s*(?:[•●▪◦‣*–—-]\s*|\d+[.)]\s+|\[\d+\]\s*)/, '').replace(/\[\d+(?:\s*[,–-]\s*\d+)*\]/g, '').replace(/\s+/g, ' ').trim();
const trimEnd = value => value.replace(/[.!?;]+$/, '').trim();

function validTerm(term) {
  const tokens = words(term);
  const introduced = /^(?:a|an|the)\s+/i.test(term);
  const noun = term.replace(/^(?:a|an|the)\s+/i, '');
  const first = words(noun)[0] || '';
  // Unintroduced lowercase unknown words are often column/hyphen fragments.
  // Explicitly introduced nouns, known STEM vocabulary and proper names are
  // accepted; unfamiliar lowercase labels can safely remain ungenerated.
  const credibleStart = introduced || TERM_VOCABULARY.has(first.toLowerCase()) ||
    (/^[A-Z\p{Lu}]/u.test(first) && !/^[A-Z]{7,}$/.test(first));
  return term.length >= 2 && term.length <= 100 && tokens.length > 0 && tokens.length <= 9 && credibleStart &&
    /\p{L}/u.test(term) && (contentWords(term).length > 0 || TERM_VOCABULARY.has(first.toLowerCase())) &&
    !/[<>={}\[\]?;,:!._]|https?:|\/{2}|\(\s*\d+\s*\)/i.test(term) && !CODE.test(term) &&
    !/^\d/.test(term) && !CLAUSE_TERM.test(term) && !TERM_PREFIX.test(noun) &&
    !INSTRUCTION.test(term) && !METADATA.test(term) &&
    !/\b(?:physical|conceptual) definition\b/i.test(term) &&
    !/\b(?:other choice|key insight|alternate solution|important detail|main question|key question|job of|goal of|concept of|problem|motivation|disadvantage)\b/i.test(noun) &&
    !/\b(?:study guide|syllabus|course|handout|agenda|learning goals?|notes|lecture|chapter|section|page|slide)\s*\d*$/i.test(term) &&
    !/^(?:it|this|that|these|those|there|we|you|i|they|he|she|what|which|who)\b/i.test(term);
}

function usableBody(body) {
  return body.length >= 8 && body.length <= 600 && words(body).length <= 85 &&
    contentWords(body).length > 0 && !INSTRUCTION.test(body) && !/:/.test(body) &&
    !CODE.test(body) && !/[‐‑-]$/.test(body) &&
    !/^(?:as follows|the following|shown below|shown above|described above|described below)\b/i.test(body) &&
    !/\b(?:and|or|of|to|by|for|from|with|which|that|the|a|an|into|because|they|their|it|its|we|our|is|are|was|were|can|may|must|will|would|should|not|during)\s*$/i.test(body) &&
    !/\b(?:at least|at most|approximately|about)\s+[\d,]+$/.test(body) &&
    !/(?:ignore|disregard).{0,35}(?:instructions?|prompts?)|(?:system|developer)\s+prompt/i.test(body);
}

function isNoise(value) {
  return value.length < 12 || value.length > MAX_QUOTE || METADATA.test(value) || INSTRUCTION.test(value) ||
    /<\/?[a-z][^>]*>|javascript:|data:text\/html|https?:\/\//i.test(value) || CODE.test(value) ||
    /^(?:\[?\d+\]?|[\W\d_]+)$/.test(value) ||
    /\b(?:doi\s*:|et al\.|ISBN\b)/i.test(value) ||
    /(.{5,40})\1{2}/.test(value) ||
    (!/\b(?:is|are|means|refers|equals)\b/i.test(value) && /^[^:]{0,30}[=∑∫].*$/.test(value));
}

function hasPredicate(value) {
  return /[:–—]/.test(value) || DEFINITION.test(value) || FACT_VERBS.test(value);
}

function termGroup(term, body) {
  const termTokens = new Set(words(term.toLowerCase()));
  const bodyTokens = new Set(words(body.toLowerCase()));
  let best = null, bestScore = 0, tied = false;
  for (const [topic, vocabulary] of TOPICS) {
    let score = 0;
    for (const token of termTokens) if (vocabulary.has(token)) score += 3;
    for (const token of bodyTokens) if (vocabulary.has(token)) score++;
    if (score > bestScore) { best = topic; bestScore = score; tied = false; }
    else if (score > 0 && score === bestScore) tied = true;
  }
  return best && !tied ? `term:${best}` : null;
}

function sentenceSpans(text, start, end) {
  const spans = [];
  let beginning = start;
  for (let index = start; index < end; index++) {
    if (!/[.!?]/.test(text[index]) || (index + 1 < end && !/\s/.test(text[index + 1]))) continue;
    // Do not split decimal values or common abbreviations in lecture prose.
    const preceding = text.slice(Math.max(beginning, index - 6), index);
    if (text[index] === '.' && /(?:\be\.g|\bi\.e|\bFig|\bEq|\bDr|\bvs|\betc)$/i.test(preceding)) continue;
    spans.push([beginning, index + 1]);
    beginning = index + 1;
  }
  if (beginning < end) spans.push([beginning, end]);
  return spans;
}

function linesOf(text) {
  const lines = [];
  for (const match of text.matchAll(/[^\r\n]+/g)) {
    const leading = match[0].search(/\S/);
    if (leading < 0) continue;
    const start = match.index + leading;
    const end = match.index + match[0].trimEnd().length;
    const previous = lines.at(-1);
    const brokenStart = previous && (/\p{L}[-‐‑]$/u.test(text.slice(previous.start, previous.end)) ||
      /\b(?:a|an|the|of|by|for|to|and|or|which|that|from|with|into|because)\s*$/i.test(previous.value));
    lines.push({start, end, value: clean(text.slice(start, end)), brokenStart,
      bullet: /^\s*(?:[•●▪◦‣*–—-]|\d+[.)]\s)/.test(match[0])});
  }
  return lines;
}

function statementSpans(page, repeatedHeaders) {
  const spans = [];
  let pending = null;
  const flush = () => {
    if (pending) for (const span of sentenceSpans(page.text, pending.start, pending.end)) spans.push(span);
    pending = null;
  };
  for (const line of page.lines) {
    if (/^(?:references|bibliography)\s*$/i.test(line.value)) { flush(); break; }
    // Discard whole caption/code lines before sentence splitting, otherwise
    // "Figure 1. Sample program: ..." turns its second sentence into a term.
    if (METADATA.test(line.value) || CODE.test(line.value)) { flush(); continue; }
    if (repeatedHeaders.has(key(line.value))) { flush(); continue; }
    const gap = pending ? page.text.slice(pending.end, line.start) : '';
    const pendingVerb = pending ? FACT_VERBS.exec(pending.value) : null;
    const incomplete = pending && (/\b(?:a|an|the|of|by|for|to|and|or|which|that|from|with|into|is|are|means|refers|as|in|on|at)\s*$/i.test(pending.value) ||
      /[,–—-]$/.test(pending.value) || (pendingVerb && pendingVerb.index + pendingVerb[0].length === pending.value.length));
    const newDefinition = /^.{2,100}?\s*[:–—]/.test(line.value) || DEFINITION.test(line.value);
    const heading = words(line.value).length <= 8 && words(line.value).filter(word => !GENERIC.has(word.toLowerCase())).every(word => /^[A-Z\d]/.test(word));
    const continuation = pending && !line.bullet && !/[.!?;]$/.test(pending.value) &&
      !/\n\s*\n/.test(gap) && line.end - pending.start <= MAX_QUOTE &&
      hasPredicate(pending.value) && !METADATA.test(line.value) && !INSTRUCTION.test(line.value) &&
      !/<\/?[a-z][^>]*>/i.test(line.value) &&
      !newDefinition && (!hasPredicate(line.value) || incomplete) &&
      (incomplete || (!heading && /^[a-z(]/.test(line.value)));
    if (continuation) {
      pending.end = line.end;
      pending.value += ` ${line.value}`;
    } else {
      flush();
      if (!line.brokenStart) pending = {...line};
    }
  }
  flush();
  return spans;
}

function definitionCandidate(value) {
  let match = value.match(/^(.{2,100}?)\s*[:–—]\s*(.+)$/);
  let term, body, relation;
  if (match) {
    [, term, body] = match;
    relation = ':';
  } else {
    match = value.match(DEFINITION);
    if (!match) return null;
    [, term, relation, body] = match;
  }
  body = trimEnd(body);
  if (!validTerm(term) || !usableBody(body) || /\d/.test(body.slice(0, 1))) return null;
  if (contentWords(body).length < 2) return null;
  term = term.replace(/^(?:a|an|the)\s+/i, '').trim();
  // Adjectival statements ("copper is conductive") remain recall statements.
  if (/^(?:is|are)$/i.test(relation) && !/^(?:an?|the)\b/i.test(body)) return null;
  return {
    prompt: `Which term matches this definition: “${body}”?`,
    answer: term, group: termGroup(term, body), category: 'definition', score: 100 + Math.min(contentWords(body).length, 15),
    identity: `definition:${key(term)}`
  };
}

function listCandidate(quote) {
  const lines = quote.split(/\r?\n/).map(line => clean(line)).filter(Boolean);
  if (lines.length < 4 || !/^.{2,100}:$/.test(lines[0])) return null;
  const term = lines[0].slice(0, -1).trim();
  if (!validTerm(term) || !lines.slice(1).every(line => words(line).length <= 6 && !hasPredicate(line))) return null;
  const answer = lines.slice(1).join(' ');
  if (!usableBody(answer)) return null;
  return {prompt: `What is listed under “${term}” in the notes?`, answer, group: null,
    category: 'list', score: 75, identity: `list:${key(term)}`};
}

function formulaCandidate(value) {
  const match = value.match(/^(.{2,100}?)\s+(is given by|can be calculated as|equals|is)\s+(.+)$/i);
  if (!match) return null;
  const [, subject, relation] = match;
  const answer = trimEnd(match[3]);
  if (!validTerm(subject) || answer.length < 2 || answer.length > 150 || words(answer).length > 18 ||
    !/\p{L}/u.test(answer) ||
    !/[πθλσΔ∑∫√²³^]|\b(?:sin|cos|tan|log|ln|exp)\s*\(|\d\s*[a-z]|[a-z]\s*[+*/=]/i.test(answer) ||
    !/[+*/=^²³πθλσΔ∑∫√()]|\d\s*[a-z]/i.test(answer)) return null;
  return {prompt: `Complete the statement: “${subject} ${relation} ____.”`, answer, group: null,
    category: 'formula', score: 90, identity: `statement:${key(value)}`};
}

function numberCandidate(value) {
  // A unit and a grammatical fact are both required. Bare equations are skipped.
  if (!hasPredicate(value) || words(value).length < 3) return null;
  const definition = value.match(DEFINITION) || value.match(/^(.{2,100}?)\s*[:–—]\s*(.+)$/);
  const verb = FACT_VERBS.exec(value);
  const subject = definition?.[1] || (verb ? value.slice(0, verb.index).trim() : '');
  if (!validTerm(subject)) return null;
  NUMBER.lastIndex = 0;
  let match;
  while ((match = NUMBER.exec(value))) {
    if (match.index > 0 && /[\p{L}\p{N}]/u.test(value[match.index - 1])) continue;
    const following = value.slice(match.index + match[0].length);
    const unit = following.match(UNIT) || following.match(/^\s*°(?=$|[\s.,;:!?)])/);
    const unitlessConstant = !unit && /\b(?:pi|π|euler['’]s number|golden ratio|avogadro['’]s number)\b/i.test(value);
    if (!unit && !unitlessConstant) continue;
    let unitText = unit ? unit[0] : '';
    // Preserve compound dimensions, e.g. J mol^-1 K^-1 and m s^-2.
    const compound = following.slice(unitText.length).match(/^(?:\s+(?:mol|[mgsAK])(?:[−-][123]|\^[−-]?[123]|[⁻−]?[¹²³])){1,3}(?=$|[\s.,;:!?)])/);
    if (compound && unit) unitText += compound[0];
    const answer = match[0] + unitText;
    const remainder = value.slice(0, match.index) + '____' + value.slice(match.index + answer.length);
    if (contentWords(remainder).length < 1 || !usableBody(value.replace(':', ' '))) continue;
    return {
      prompt: `Complete the statement: “${remainder}”`, answer,
      group: unit ? `quantity:${unitText.trim().replace(/\s+/g, ' ')}` : null, category: 'number', score: 95,
      identity: `statement:${key(value)}`
    };
  }
  return null;
}

function factCandidate(value) {
  let match = FACT_VERBS.exec(value);
  let subject, relation, body;
  if (match) {
    subject = value.slice(0, match.index).trim();
    relation = match[0];
    body = trimEnd(value.slice(match.index + relation.length).trim());
  } else {
    match = value.match(DEFINITION);
    if (!match) return null;
    [, subject, relation, body] = match;
    body = trimEnd(body);
  }
  if (!validTerm(subject) || !usableBody(body) || /[=:<>]/.test(body) || words(body).length > 35) return null;
  // Quantities belong to the unit-aware path. This also avoids silently turning
  // flattened PDF exponents (e.g. "103 - 104") into ordinary prose answers.
  if (/\b\d{2,}(?:[.,]\d+)?\b/.test(body)) return null;
  const first = words(subject.replace(/^(?:a|an|the)\s+/i, ''))[0] || '';
  if (!TERM_VOCABULARY.has(first.toLowerCase()) && !/[a-z][A-Z]|^[A-Z]{2,6}$/.test(first) &&
    !/\b(?:Newton|Ohm|Faraday|Einstein|Kepler|Kirchhoff|Hooke|Boyle|Charles|Avogadro|Pythagorean|Coulomb|Gauss)\b/i.test(first)) return null;
  if (/^(?:that|whether|been|to|underway|authorized)\b/i.test(body) || /\b(?:or by|and by)\b/i.test(subject)) return null;
  if (/^(?:and|or|but|so|because)\b/i.test(subject)) return null;
  return {
    prompt: `Complete the statement: “${subject} ${relation} ____.”`, answer: body,
    group: null, category: 'fact', score: 65 + Math.min(contentWords(body).length, 12),
    identity: `statement:${key(value)}`
  };
}

function distinctOptions(candidate, pool) {
  const options = [];
  const answerKey = key(candidate.answer);
  const used = new Set([answerKey]);
  for (const other of pool) {
    const optionKey = key(other.answer);
    if (used.has(optionKey) || optionKey.includes(answerKey) || answerKey.includes(optionKey)) continue;
    // Identical descriptions can be aliases; they must not become distractors.
    if (candidate.category === 'definition' && key(other.prompt) === key(candidate.prompt)) continue;
    used.add(optionKey);
    options.push(other.answer);
    if (options.length === 3) break;
  }
  return options.length === 3 ? options : [];
}

function exactAnswer(quote, answer) {
  if (quote.includes(answer)) return answer;
  const escaped = answer.split(/\s+/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
  return quote.match(new RegExp(escaped))?.[0] || null;
}

/** Extract up to 40 source-grounded cards from [{page, text}]. No DOM or network. */
export function generateQuestions(pages, options = {}) {
  const requestedLimit = options && typeof options.limit === 'number' && Number.isFinite(options.limit) ? Math.floor(options.limit) : 20;
  const limit = Math.min(MAX_CARDS, Math.max(0, requestedLimit));
  const stats = {pagesProcessed: 0, charactersProcessed: 0, candidatesFound: 0, cardsGenerated: 0,
    choiceCards: 0, recallCards: 0, duplicateStatements: 0, ignoredStatements: 0, truncated: false, limit};
  if (!Array.isArray(pages) || !limit) return {cards: [], stats};

  const prepared = [];
  const headerPages = new Map();
  for (let index = 0; index < Math.min(pages.length, MAX_PAGES); index++) {
    const entry = pages[index];
    if (!entry || typeof entry.text !== 'string' || !entry.text.trim()) continue;
    const remaining = MAX_CHARACTERS - stats.charactersProcessed;
    if (remaining <= 0) { stats.truncated = true; break; }
    const text = entry.text.slice(0, remaining);
    if (text.length < entry.text.length) stats.truncated = true;
    const page = Number.isSafeInteger(entry.page) && entry.page > 0 ? entry.page : index + 1;
    const lines = linesOf(text);
    prepared.push({text, page, lines});
    stats.pagesProcessed++;
    stats.charactersProcessed += text.length;
    const seenHeaders = new Set();
    for (const line of lines) {
      if (line.value.length > 120 || hasPredicate(line.value) || /[.!?]$/.test(line.value)) continue;
      const identity = key(line.value);
      if (seenHeaders.has(identity)) continue;
      seenHeaders.add(identity);
      headerPages.set(identity, (headerPages.get(identity) || 0) + 1);
    }
  }
  if (pages.length > MAX_PAGES) stats.truncated = true;
  const repeatedHeaders = new Set([...headerPages].filter(([, count]) => count > 1).map(([identity]) => identity));
  const seenStatements = new Set();
  const seenCandidates = new Set();
  const seenPrompts = new Set();
  const candidates = [];
  for (const page of prepared) {
    for (const [start, end] of statementSpans(page, repeatedHeaders)) {
      const quote = page.text.slice(start, end).trim();
      const value = clean(quote);
      if (quote.length > MAX_QUOTE || /\p{L}[-‐‑]\s*\n\s*\p{L}/u.test(quote) || isNoise(value)) { stats.ignoredStatements++; continue; }
      const identity = key(value);
      if (seenStatements.has(identity)) { stats.duplicateStatements++; continue; }
      seenStatements.add(identity);
      const candidate = numberCandidate(value) || formulaCandidate(value) || listCandidate(quote) || definitionCandidate(value) || factCandidate(value);
      if (!candidate) { stats.ignoredStatements++; continue; }
      const explicitBullet = /^\s*(?:[•●▪◦‣*–—-]|\d+[.)]\s)/.test(quote);
      if (candidate.category === 'fact' && ((!/[.!?]$/.test(value) && !explicitBullet) ||
        (/^[a-z]/.test(value) && !/^(?:a|an|the)\s/i.test(value) && !explicitBullet))) {
        stats.ignoredStatements++; continue;
      }
      const groundedAnswer = exactAnswer(quote, candidate.answer);
      if (!groundedAnswer) { stats.ignoredStatements++; continue; }
      candidate.answer = groundedAnswer;
      const promptIdentity = candidate.prompt.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seenCandidates.has(candidate.identity) || seenPrompts.has(promptIdentity)) { stats.duplicateStatements++; continue; }
      seenCandidates.add(candidate.identity);
      seenPrompts.add(promptIdentity);
      candidate.source = {page: page.page, quote};
      candidate.order = candidates.length;
      candidates.push(candidate);
      if (candidates.length >= MAX_CANDIDATES) break;
    }
    if (candidates.length >= MAX_CANDIDATES) { stats.truncated = true; break; }
  }
  stats.candidatesFound = candidates.length;
  const pools = new Map();
  for (const candidate of candidates) {
    if (!candidate.group) continue;
    if (!pools.has(candidate.group)) pools.set(candidate.group, []);
    pools.get(candidate.group).push(candidate);
  }
  candidates.sort((left, right) => right.score - left.score || left.order - right.order);
  const cards = candidates.slice(0, limit).map(candidate => {
    const distractors = candidate.group ? distinctOptions(candidate, pools.get(candidate.group)) : [];
    const kind = distractors.length === 3 ? 'choice' : 'recall';
    if (kind === 'choice') stats.choiceCards++; else stats.recallCards++;
    return {prompt: candidate.prompt, answer: candidate.answer, distractors, kind,
      explanation: `The notes state: “${candidate.source.quote}”`, source: candidate.source};
  });
  stats.cardsGenerated = cards.length;
  return {cards, stats};
}
