import { useState, useCallback, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   CROCK N' ROLL — grocery runs & slow cooker fun
   ═══════════════════════════════════════════════════════════ */

function Logo({ size = 28 }) {
  return (
    <svg width={size*2.8} height={size} viewBox="0 0 112 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="22" cy="30" rx="14" ry="8" fill="#0071DC" opacity="0.9"/>
      <rect x="10" y="18" width="24" height="14" rx="4" fill="#0071DC"/>
      <ellipse cx="22" cy="18" rx="13" ry="3" fill="#004C91"/>
      <circle cx="22" cy="16" r="2" fill="#FFC220"/>
      <rect x="5" y="22" width="5" height="3" rx="1.5" fill="#004C91"/>
      <rect x="34" y="22" width="5" height="3" rx="1.5" fill="#004C91"/>
      <path d="M17 14Q15 10 17 6" stroke="#0071DC" strokeWidth="1.5" fill="none" opacity=".4" strokeLinecap="round"><animate attributeName="d" values="M17 14Q15 10 17 6;M17 14Q19 10 17 6;M17 14Q15 10 17 6" dur="2s" repeatCount="indefinite"/></path>
      <path d="M22 13Q20 8 22 4" stroke="#0071DC" strokeWidth="1.5" fill="none" opacity=".5" strokeLinecap="round"><animate attributeName="d" values="M22 13Q20 8 22 4;M22 13Q24 8 22 4;M22 13Q20 8 22 4" dur="2.5s" repeatCount="indefinite"/></path>
      <path d="M27 14Q25 9 27 5" stroke="#0071DC" strokeWidth="1.5" fill="none" opacity=".35" strokeLinecap="round"><animate attributeName="d" values="M27 14Q25 9 27 5;M27 14Q29 9 27 5;M27 14Q25 9 27 5" dur="1.8s" repeatCount="indefinite"/></path>
      <text x="44" y="20" fontFamily="sans-serif" fontWeight="800" fontSize="14" fill="#1D1D1F" letterSpacing="-.5">CROCK</text>
      <text x="44" y="35" fontFamily="sans-serif" fontWeight="800" fontSize="14" fill="#1D1D1F" letterSpacing="-.5">N'</text>
      <text x="61" y="35" fontFamily="sans-serif" fontWeight="800" fontSize="14" fill="#1D1D1F" letterSpacing="-.5">R</text>
      <rect x="73" y="26" width="12" height="7" rx="3.5" fill="#D4A34A"/>
      <rect x="74" y="27" width="3" height="5" rx="1.5" fill="#C4903A" opacity=".5"/>
      <rect x="79" y="27" width="2" height="5" rx="1" fill="#C4903A" opacity=".4"/>
      <text x="87" y="35" fontFamily="sans-serif" fontWeight="800" fontSize="14" fill="#1D1D1F" letterSpacing="-.5">LL</text>
    </svg>
  );
}

const STORES = [
  { id: "walmart", name: "Walmart", color: "#0071DC", bg: "#E8F1FB", badge: "#FFC220", badgeText: "#004C91" },
  { id: "harris-teeter", name: "Harris Teeter", color: "#C41230", bg: "#FCE8EC", badge: "#C41230", badgeText: "#FFF" },
  { id: "target", name: "Target", color: "#CC0000", bg: "#FDE8E8", badge: "#CC0000", badgeText: "#FFF" },
  { id: "food-lion", name: "Food Lion", color: "#003DA5", bg: "#E6EEF8", badge: "#003DA5", badgeText: "#FFF" },
];

const DEFAULT_MEALS = [
  { id:"pot-roast",name:"Classic Pot Roast",emoji:"🥩",desc:"Tender roast with potatoes, carrots & celery",cookTime:"8 hrs low / 4 hrs high",servings:4,protein:"38g",veggies:"carrots, celery, potatoes",
    ingredients:[{item:"Chuck roast (2-3 lbs)",qty:"1 pkg",cat:"meat"},{item:"Baby potatoes (no peeling!)",qty:"1 bag (1.5 lb)",cat:"produce"},{item:"Baby carrots (pre-cut)",qty:"1 bag (1 lb)",cat:"produce"},{item:"Celery stalks",qty:"4 stalks",cat:"produce"},{item:"Onion soup mix packet",qty:"1 packet",cat:"pantry"},{item:"Beef broth (32 oz)",qty:"1 carton",cat:"pantry"}],
    steps:["Baby potatoes (whole), baby carrots, celery in the bottom.","Chuck roast on top.","Sprinkle onion soup mix.","Pour beef broth. Garlic powder, salt & pepper.","LOW 8 hrs or HIGH 4 hrs.","Falls apart with a fork."]},
  { id:"garlic-parm",name:"Garlic Parm Chicken",emoji:"🍗",desc:"BWW-style garlic parmesan",cookTime:"4 hrs low / 2 hrs high",servings:4,protein:"42g",veggies:"green beans, potatoes",
    ingredients:[{item:"Chicken breasts (boneless)",qty:"2 lbs",cat:"meat"},{item:"BWW Garlic Parmesan sauce",qty:"1 bottle",cat:"sauces"},{item:"Green beans (frozen steamable)",qty:"1 bag (12 oz)",cat:"frozen"},{item:"Baby potatoes",qty:"1 bag (1.5 lb)",cat:"produce"},{item:"Chicken broth",qty:"1/2 cup",cat:"pantry"}],
    steps:["Chicken in slow cooker.","Pour BWW sauce over chicken.","Splash of broth. Potatoes around chicken.","LOW 4 hrs or HIGH 2 hrs.","Steam green beans.","Serve together."]},
  { id:"enchilada",name:"Chicken Enchilada Bowl",emoji:"🌯",desc:"All the flavor, zero rolling",cookTime:"6 hrs low / 3 hrs high",servings:4,protein:"36g",veggies:"tomatoes, corn, beans",
    ingredients:[{item:"Chicken breasts (boneless)",qty:"2 lbs",cat:"meat"},{item:"Enchilada sauce (15 oz)",qty:"2 cans",cat:"sauces"},{item:"Black beans (15 oz)",qty:"1 can",cat:"canned"},{item:"Corn (frozen or canned)",qty:"1 bag/can",cat:"canned"},{item:"Rotel diced tomatoes",qty:"1 can",cat:"canned"},{item:"Cream cheese (8 oz)",qty:"1 block",cat:"dairy"},{item:"Shredded Mexican cheese",qty:"1 bag (8 oz)",cat:"dairy"}],
    steps:["Chicken + enchilada sauce.","Add beans, corn, Rotel, cumin, chili powder.","LOW 6 hrs or HIGH 3 hrs.","Shred chicken. Stir in cream cheese.","Top with Mexican cheese."]},
  { id:"pork-chops",name:"Smothered Pork Chops",emoji:"🍖",desc:"Fork-tender in creamy gravy",cookTime:"6-7 hrs low",servings:4,protein:"40g",veggies:"carrots, green beans, potatoes",
    ingredients:[{item:"Bone-in pork chops (thick cut)",qty:"4 chops",cat:"meat"},{item:"Cream of chicken soup (10.5 oz)",qty:"1 can",cat:"canned"},{item:"Ranch dressing mix packet",qty:"1 packet",cat:"pantry"},{item:"Baby potatoes",qty:"1 bag (1.5 lb)",cat:"produce"},{item:"Baby carrots",qty:"1 bag (1 lb)",cat:"produce"},{item:"Green beans (frozen steamable)",qty:"1 bag (12 oz)",cat:"frozen"}],
    steps:["Potatoes and carrots in bottom.","Season chops with ranch + garlic powder.","Whisk soup + broth, pour over.","LOW 6-7 hrs.","Steam green beans.","Gravy makes itself."]},
  { id:"chili",name:"White Chicken Chili",emoji:"🫘",desc:"Dump-and-go, packed with beans",cookTime:"8 hrs low / 4 hrs high",servings:5,protein:"41g",veggies:"corn, onion, chiles, beans",
    ingredients:[{item:"Chicken breasts (boneless)",qty:"1.5 lbs",cat:"meat"},{item:"Cannellini/white beans (15 oz)",qty:"2 cans",cat:"canned"},{item:"Pinto beans (15 oz)",qty:"1 can",cat:"canned"},{item:"Salsa verde (16 oz)",qty:"1 jar",cat:"sauces"},{item:"Chicken broth (32 oz)",qty:"1 carton",cat:"pantry"},{item:"Diced green chiles (4 oz)",qty:"1 can",cat:"canned"},{item:"Frozen corn",qty:"1 bag (10 oz)",cat:"frozen"},{item:"Onion",qty:"1 whole",cat:"produce"}],
    steps:["Drain beans. Into slow cooker.","Chicken on top. Onion, chiles, salsa, corn.","Broth. Cumin, oregano.","LOW 8 hrs or HIGH 4 hrs.","Shred chicken, return.","Mash some beans to thicken."]},
  { id:"tuna",name:"Tuna Noodle Casserole",emoji:"🐟",desc:"Creamy tuna with peas & carrots",cookTime:"2-3 hrs low",servings:4,protein:"30g",veggies:"peas, carrots",
    ingredients:[{item:"Canned tuna in water (5 oz)",qty:"3 cans",cat:"canned"},{item:"Egg noodles (wide)",qty:"8 oz",cat:"pantry"},{item:"Cream of mushroom soup (10.5 oz)",qty:"1 can",cat:"canned"},{item:"Frozen peas",qty:"1 bag (10 oz)",cat:"frozen"},{item:"Frozen peas & carrots mix",qty:"1 bag (10 oz)",cat:"frozen"},{item:"Shredded cheddar cheese",qty:"1 bag (8 oz)",cat:"dairy"}],
    steps:["Noodles just under al dente. Drain.","Drain tuna. Mix with soup, broth, seasoning.","Fold in noodles, peas, peas & carrots.","Grease slow cooker. Pour in. Half cheese.","LOW 2-3 hrs. Don't stir.","Rest of cheese 15 min before done."]},
];

const DEFAULT_WEEKLY = [
  {item:"LaCroix Tangerine (12-pack)",qty:"×2",cat:"drinks"},
  {item:"Boost High Protein - Chocolate",qty:"6-pack",cat:"drinks"},
  {item:"Boost High Protein - Strawberry",qty:"6-pack",cat:"drinks"},
  {item:"String cheese",qty:"12 ct pack",cat:"snacks"},
  {item:"Hard boiled eggs (pre-made)",qty:"6 ct pack",cat:"snacks"},
  {item:"Canned tuna in water (lunches)",qty:"4 cans",cat:"canned"},
];

const DEFAULT_HOUSEHOLD = [
  {name:"🧴 Bathroom & Body",items:["Shampoo","Conditioner","Body wash","Lotion","Deodorant","Toothpaste","Toothbrush","Floss","Razors"]},
  {name:"🧻 Paper & Cleaning",items:["Paper towels","Toilet paper","Trash bags","Dish soap","All-purpose cleaner","Aluminum foil","Ziploc bags","Sponges","Laundry detergent"]},
  {name:"🍬 Treats",items:["Pork rinds","Peanut Butter Mini M&M's","String cheese sticks"]},
];

const STORE_KEY = "crockn-roll-v3";

export default function App() {
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [weeklyItems, setWeeklyItems] = useState(DEFAULT_WEEKLY);
  const [householdCats, setHouseholdCats] = useState(DEFAULT_HOUSEHOLD);
  const [rotIdx, setRotIdx] = useState(0);
  const [secondMeal, setSecondMeal] = useState(false);
  const [hNeeds, setHNeeds] = useState(new Set());
  const [hDone, setHDone] = useState(false);
  const [custom, setCustom] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");
  const [editName, setEditName] = useState(false);
  const [headerImg, setHeaderImg] = useState("");
  const [storeId, setStoreId] = useState("walmart");
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home");
  const [recipe, setRecipe] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [newMealEmoji, setNewMealEmoji] = useState("🍽️");
  const [showAddW, setShowAddW] = useState(false);
  const [newWI, setNewWI] = useState("");
  const [newWQ, setNewWQ] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCN, setNewCN] = useState("");
  const [newCI, setNewCI] = useState("");
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);
  const [purchased, setPurchased] = useState(false);
  // AI meal finder
  const [showFinder, setShowFinder] = useState(false);
  const [finderQuery, setFinderQuery] = useState("");
  const [finderLoading, setFinderLoading] = useState(false);
  const [finderResult, setFinderResult] = useState(null);
  const [finderError, setFinderError] = useState("");

  const store = STORES.find(s => s.id === storeId) || STORES[0];

  // Rotation: pick 1 meal, optional 2nd
  const getMainMeal = useCallback(() => {
    if (meals.length === 0) return null;
    return meals[rotIdx % meals.length];
  }, [meals, rotIdx]);

  const getSecondMealData = useCallback(() => {
    if (!secondMeal || meals.length < 2) return null;
    return meals[(rotIdx + 1) % meals.length];
  }, [meals, rotIdx, secondMeal]);

  const advance = () => {
    setRotIdx(prev => (prev + (secondMeal ? 2 : 1)) % Math.max(meals.length, 1));
  };

  const markPurchased = () => {
    advance();
    setHNeeds(new Set()); setHDone(false); setCustom([]);
    setSecondMeal(false); setShowConfirmPurchase(false);
    setPurchased(true); setTimeout(() => setPurchased(false), 3000);
  };

  // Load/Save using localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.meals?.length) setMeals(d.meals);
        if (d.weeklyItems) setWeeklyItems(d.weeklyItems);
        if (d.householdCats) setHouseholdCats(d.householdCats);
        if (d.rotIdx != null) setRotIdx(d.rotIdx);
        if (d.custom) setCustom(d.custom);
        if (d.userName) setUserName(d.userName);
        if (d.headerImg) setHeaderImg(d.headerImg);
        if (d.storeId) setStoreId(d.storeId);
        if (d.hNeeds) setHNeeds(new Set(d.hNeeds));
        if (d.secondMeal) setSecondMeal(d.secondMeal);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ meals, weeklyItems, householdCats, rotIdx, custom, userName, headerImg, storeId, hNeeds: [...hNeeds], secondMeal })); } catch {}
  }, [meals, weeklyItems, householdCats, rotIdx, custom, userName, headerImg, storeId, hNeeds, secondMeal, loaded]);

  // Helpers
  const toggleH = item => { setHNeeds(p => { const n = new Set(p); n.has(item)?n.delete(item):n.add(item); return n; }); setHDone(false); };
  const addCustom = () => { const t = newItem.trim(); if (t && !custom.includes(t)) { setCustom(p=>[...p,t]); setNewItem(""); }};
  const rmCustom = item => setCustom(p=>p.filter(i=>i!==item));
  const deleteMeal = id => { setMeals(p=>p.filter(m=>m.id!==id)); setConfirmDel(null); };
  const addMealObj = (meal) => setMeals(p => [...p, meal]);
  const addMealForm = () => {
    if (!newMealName.trim()) return;
    addMealObj({id:Date.now().toString(),name:newMealName.trim(),emoji:newMealEmoji||"🍽️",desc:"Custom meal",cookTime:"Set time",servings:4,protein:"—",veggies:"—",ingredients:[],steps:["Add steps!"]});
    setNewMealName(""); setNewMealEmoji("🍽️"); setShowAddMeal(false);
  };
  const addWeekly = () => { if(!newWI.trim())return; setWeeklyItems(p=>[...p,{item:newWI.trim(),qty:newWQ.trim()||"1",cat:"added"}]); setNewWI(""); setNewWQ(""); setShowAddW(false); };
  const rmWeekly = idx => setWeeklyItems(p=>p.filter((_,i)=>i!==idx));
  const addCat = () => { if(!newCN.trim())return; setHouseholdCats(p=>[...p,{name:newCN.trim(),items:newCI.trim()?[newCI.trim()]:[]}]); setNewCN(""); setNewCI(""); setShowAddCat(false); };
  const addToCat = (ci,item) => { if(!item.trim())return; setHouseholdCats(p=>p.map((c,i)=>i===ci?{...c,items:[...c.items,item.trim()]}:c)); };
  const rmCat = ci => setHouseholdCats(p=>p.filter((_,i)=>i!==ci));

  const thisWeek = [getMainMeal(), getSecondMealData()].filter(Boolean);

  const groceryList = useCallback(() => {
    const items = [];
    thisWeek.forEach(m => m.ingredients.forEach(ing => items.push({...ing,src:m.name})));
    weeklyItems.forEach(e => items.push({...e,src:"Weekly"}));
    custom.forEach(ci => items.push({item:ci,qty:"",cat:"added",src:"You"}));
    [...hNeeds].forEach(h => items.push({item:h,qty:"",cat:"household",src:"Essentials"}));
    return items;
  }, [thisWeek, weeklyItems, custom, hNeeds]);

  const copyList = () => {
    const list = groceryList();
    const cats = {}; list.forEach(i=>{const k=i.cat||"other";if(!cats[k])cats[k]=[];cats[k].push(i);});
    let t = `Crock N' Roll${userName?` — ${userName}`:""}\n${thisWeek.map(m=>m.name).join(" + ")}\n\n`;
    Object.entries(cats).forEach(([cat,items])=>{t+=`— ${cat.toUpperCase()} —\n`;items.forEach(i=>t+=`☐ ${i.item}${i.qty?` (${i.qty})`:""}\n`);t+="\n";});
    t+=`${list.length} items · ${store.name}`;
    navigator.clipboard?.writeText(t); setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  // AI Meal Finder
  const findMeal = async () => {
    if (!finderQuery.trim()) return;
    setFinderLoading(true); setFinderError(""); setFinderResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a slow cooker recipe assistant. The user wants easy slow cooker meals. They prefer: whole meat pieces (no ground beef), minimal prep (baby carrots, baby potatoes — no peeling/chopping), dump-and-go style, and meals that last 4+ days for one person.

The user says: "${finderQuery}"

Respond with ONLY valid JSON, no markdown, no backticks. Use this exact format:
{"name":"Meal Name","emoji":"🍲","desc":"Short description","cookTime":"X hrs low / Y hrs high","servings":4,"protein":"XXg","veggies":"list of veggies","ingredients":[{"item":"Item name","qty":"amount","cat":"meat|produce|canned|frozen|dairy|pantry|sauces"}],"steps":["Step 1","Step 2"]}` }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const meal = JSON.parse(clean);
      meal.id = Date.now().toString();
      setFinderResult(meal);
    } catch (e) {
      setFinderError("Couldn't find a meal. Try describing what you want differently.");
    }
    setFinderLoading(false);
  };

  const addFoundMeal = () => {
    if (finderResult) {
      addMealObj(finderResult);
      setFinderResult(null); setFinderQuery(""); setShowFinder(false);
    }
  };

  const c = {
    bg:"#F0F0F2",surface:"#FFF",border:"#DCDCE0",borderLt:"#EAEAEE",
    text:"#1D1D1F",textMid:"#5A5A64",textDim:"#8E8E93",textFt:"#B0B0B8",
    accent:store.color,accentBg:store.bg,
    warm:"#C4680F",warmBg:"#FFF3E6",
    green:"#1F8B42",greenBg:"#E4F3E8",
    red:"#CC2936",redBg:"#FDE8EA",
  };
  const s = {border:"none",borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,transition:"all .15s"};
  const pill = (bg,color,label) => <span key={label} style={{background:bg,color,padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
  const nav = (key,label) => <button key={key} onClick={()=>{setView(key);setRecipe(null);}} style={{...s,flex:1,padding:"8px 2px",fontSize:11,background:view===key?c.accent:"transparent",color:view===key?"#FFF":c.textMid,borderRadius:8}}>{label}</button>;
  const inp = {padding:"10px 12px",borderRadius:8,border:`1.5px solid ${c.border}`,background:c.bg,fontSize:13,fontFamily:"'DM Sans'",outline:"none",color:c.text};

  if (!loaded) return <div style={{fontFamily:"'DM Sans'",textAlign:"center",padding:60,color:"#8E8E93"}}>Loading...</div>;

  const main = getMainMeal();
  const second = getSecondMealData();

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:c.bg,minHeight:"100vh",color:c.text,maxWidth:500,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{background:c.surface,padding:"18px 16px 12px",borderBottom:`1px solid ${c.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {headerImg?<img src={headerImg} alt="" style={{height:36,borderRadius:8}}/>:<Logo size={28}/>}
          <div style={{flex:1}}>
            {userName?<div style={{fontSize:12,color:c.textDim}}>{userName}'s plan <button onClick={()=>setEditName(true)} style={{...s,background:"none",color:c.accent,padding:0,fontSize:11}}>edit</button></div>
            :<button onClick={()=>setEditName(true)} style={{...s,background:"none",color:c.accent,padding:0,fontSize:12}}>+ add your name</button>}
          </div>
          <div style={{background:store.badge,borderRadius:7,padding:"3px 9px",fontSize:10,fontWeight:700,color:store.badgeText}}>{store.name.toUpperCase()}</div>
        </div>
        {editName&&<div style={{display:"flex",gap:6,marginTop:10}}>
          <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Your name..." style={{...inp,flex:1}}/>
          <button onClick={()=>setEditName(false)} style={{...s,background:c.accent,color:"#FFF",padding:"8px 14px",fontSize:12}}>Save</button>
        </div>}
        <div style={{display:"flex",gap:3,marginTop:12,background:c.bg,borderRadius:10,padding:3}}>
          {nav("home","🏠 Week")}
          {nav("check","✅ Check")}
          {nav("list","🛒 List")}
          {nav("meals","🍲 Meals")}
          {nav("manage","⚙️")}
        </div>
      </div>

      <div style={{padding:"14px 14px 88px"}}>

        {/* ═══ HOME ═══ */}
        {view==="home"&&<>
          {purchased&&<div style={{background:c.greenBg,border:`1.5px solid ${c.green}`,borderRadius:12,padding:14,marginBottom:12,textAlign:"center",color:c.green,fontSize:14,fontWeight:700}}>✅ Done! Next week's meal is ready.</div>}

          <div style={{fontSize:11,fontWeight:700,color:c.textDim,textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>This week — picked for you</div>

          {main&&<div style={{background:c.surface,border:`2px solid ${c.accent}`,borderRadius:14,padding:16,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:32}}>{main.emoji}</span>
              <div><div style={{fontSize:16,fontWeight:700}}>{main.name}</div><div style={{fontSize:12,color:c.textDim}}>{main.desc}</div></div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {pill(c.greenBg,c.green,`${main.protein} protein`)}
              {pill(c.accentBg,c.accent,`⏱ ${main.cookTime}`)}
              {pill(c.warmBg,c.warm,`🥬 ${main.veggies}`)}
            </div>
            <button onClick={()=>{setRecipe(main.id);setView("meals");}} style={{...s,width:"100%",padding:"8px",background:c.accentBg,color:c.accent,fontSize:12,border:`1px solid ${c.accent}40`,borderRadius:8}}>View Recipe →</button>
          </div>}

          {second&&<div style={{background:c.surface,border:`2px solid ${c.accent}`,borderRadius:14,padding:16,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:32}}>{second.emoji}</span>
              <div><div style={{fontSize:16,fontWeight:700}}>{second.name}</div><div style={{fontSize:12,color:c.textDim}}>{second.desc}</div></div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {pill(c.greenBg,c.green,`${second.protein} protein`)}
              {pill(c.accentBg,c.accent,`⏱ ${second.cookTime}`)}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setRecipe(second.id);setView("meals");}} style={{...s,flex:1,padding:"8px",background:c.accentBg,color:c.accent,fontSize:12,border:`1px solid ${c.accent}40`,borderRadius:8}}>View Recipe →</button>
              <button onClick={()=>setSecondMeal(false)} style={{...s,padding:"8px 12px",background:c.surface,color:c.textDim,fontSize:11,border:`1px solid ${c.border}`}}>Remove 2nd</button>
            </div>
          </div>}

          {!secondMeal&&meals.length>=2&&<button onClick={()=>setSecondMeal(true)} style={{...s,width:"100%",padding:"12px",background:c.surface,color:c.accent,border:`1.5px dashed ${c.accent}`,borderRadius:12,fontSize:13,marginBottom:10}}>
            + Add a second meal this week
          </button>}

          <button onClick={()=>setView("check")} style={{...s,width:"100%",padding:"14px",marginTop:4,background:c.accent,color:"#FFF",fontSize:14,borderRadius:12}}>✅ Essentials Check →</button>
          <button onClick={()=>setView("list")} style={{...s,width:"100%",padding:"14px",marginTop:6,background:c.surface,color:c.accent,fontSize:14,borderRadius:12,border:`1.5px solid ${c.accent}`}}>🛒 Grocery List</button>

          {!showConfirmPurchase?
            <button onClick={()=>setShowConfirmPurchase(true)} style={{...s,width:"100%",padding:"14px",marginTop:12,background:c.greenBg,color:c.green,fontSize:14,borderRadius:12,border:`1.5px solid ${c.green}`}}>✅ Purchased — next week!</button>
          :<div style={{background:c.surface,borderRadius:12,padding:14,marginTop:12,border:`2px solid ${c.green}`}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Move to next week?</div>
            <div style={{fontSize:12,color:c.textDim,marginBottom:12}}>Clears extras & essentials. Rotates to next meal.</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={markPurchased} style={{...s,flex:1,padding:"12px",background:c.green,color:"#FFF",fontSize:13}}>Yes!</button>
              <button onClick={()=>setShowConfirmPurchase(false)} style={{...s,flex:1,padding:"12px",background:c.surface,color:c.textMid,fontSize:13,border:`1px solid ${c.border}`}}>Not yet</button>
            </div>
          </div>}

          <div style={{background:c.accentBg,borderRadius:10,padding:12,marginTop:12,fontSize:12,color:c.accent,lineHeight:1.6}}>
            <strong>📤 Sharing this URL?</strong> Others get their own clean app — they won't see your meals or list. To share your specific list, copy it and send it.
          </div>
        </>}

        {/* ═══ CHECK ═══ */}
        {view==="check"&&<>
          <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>✅ Quick Essentials Check</div>
          <div style={{fontSize:12,color:c.textDim,marginBottom:14}}>Tap what you need, or skip.</div>
          <button onClick={()=>{setHDone(true);setHNeeds(new Set());}} style={{...s,width:"100%",padding:"14px",marginBottom:16,background:hDone?c.greenBg:"#FFF8E1",border:`1.5px solid ${hDone?c.green:"#FFC220"}`,color:hDone?c.green:c.warm,fontSize:14,borderRadius:12}}>
            {hDone?"✅ All good!":"👍 I'm good on everything"}
          </button>
          {!hDone&&householdCats.map((cat,ci)=><div key={ci} style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:c.textMid,marginBottom:6}}>{cat.name}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {cat.items.map((item,ii)=>{const need=hNeeds.has(item);return <button key={ii} onClick={()=>toggleH(item)} style={{...s,padding:"7px 13px",fontSize:12,background:need?c.accent:c.surface,color:need?"#FFF":c.textMid,border:`1.5px solid ${need?c.accent:c.border}`,borderRadius:20}}>{need?"✓ ":""}{item}</button>;})}
            </div>
          </div>)}
          {(hDone||hNeeds.size>0)&&<button onClick={()=>setView("list")} style={{...s,width:"100%",padding:"14px",marginTop:8,background:c.accent,color:"#FFF",fontSize:14,borderRadius:12}}>🛒 Grocery List →{hNeeds.size>0?` (+${hNeeds.size})`:""}</button>}
        </>}

        {/* ═══ LIST ═══ */}
        {view==="list"&&(()=>{
          const list=groceryList();
          const cats={};list.forEach(i=>{const k=i.cat||"other";if(!cats[k])cats[k]=[];cats[k].push(i);});
          const labels={meat:"🥩 Meat",produce:"🥕 Produce",pantry:"📦 Pantry",canned:"🥫 Canned",sauces:"🫙 Sauces",dairy:"🧀 Dairy",frozen:"🧊 Frozen",drinks:"🥤 Drinks",snacks:"🧃 Snacks",added:"📝 Extras",household:"🧻 Household"};
          return <>
            <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>🛒 Grocery List</div>
            <div style={{fontSize:11,color:c.textDim,marginBottom:8}}>{thisWeek.map(m=>m.name).join(" + ")}</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="+ add item..." style={{...inp,flex:1}}/>
              <button onClick={addCustom} style={{...s,padding:"10px 14px",background:c.accent,color:"#FFF",fontSize:12}}>Add</button>
            </div>
            {Object.entries(cats).map(([cat,items])=><div key={cat} style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:c.textDim,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{labels[cat]||cat}</div>
              {items.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",marginBottom:3,background:c.surface,borderRadius:8,border:`1px solid ${c.borderLt}`,fontSize:13}}>
                <input type="checkbox" style={{accentColor:c.accent,width:15,height:15}}/>
                <div style={{flex:1}}><div>{item.item}</div><div style={{fontSize:10,color:c.textFt}}>{item.qty?`${item.qty} · `:""}{item.src}</div></div>
                {item.src==="You"&&<button onClick={()=>rmCustom(item.item)} style={{...s,background:"none",color:c.textFt,fontSize:14,padding:"2px 6px"}}>✕</button>}
              </div>)}
            </div>)}
            <div style={{background:c.accentBg,borderRadius:8,padding:8,textAlign:"center",fontSize:12,color:c.accent,fontWeight:600}}>{list.length} items · {store.name}</div>
            <button onClick={copyList} style={{...s,width:"100%",padding:"13px",marginTop:10,background:c.accent,color:"#FFF",fontSize:13}}>{copied?"✅ Copied!":"📋 Copy List (text to family, paste anywhere)"}</button>
            <button onClick={markPurchased} style={{...s,width:"100%",padding:"13px",marginTop:6,background:c.greenBg,color:c.green,fontSize:13,border:`1.5px solid ${c.green}`,borderRadius:10}}>✅ Purchased — next week</button>
          </>;
        })()}

        {/* ═══ MEALS ═══ */}
        {view==="meals"&&!recipe&&<>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Your {meals.length} Meals</div>
          {meals.map(m=><div key={m.id} style={{position:"relative",marginBottom:8}}>
            <button onClick={()=>setRecipe(m.id)} style={{...s,width:"100%",textAlign:"left",display:"flex",alignItems:"center",gap:10,padding:"14px",background:c.surface,border:`1px solid ${c.border}`,borderRadius:14}}>
              <span style={{fontSize:30}}>{m.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700}}>{m.name}</div>
                <div style={{fontSize:11,color:c.textDim,marginTop:2}}>{m.desc}</div>
                <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>{pill(c.greenBg,c.green,`${m.protein}`)}{pill(c.accentBg,c.accent,`⏱ ${m.cookTime}`)}</div>
              </div>
              <span style={{color:c.textFt}}>›</span>
            </button>
            {confirmDel===m.id?<div style={{display:"flex",gap:4,marginTop:4}}>
              <button onClick={()=>deleteMeal(m.id)} style={{...s,flex:1,padding:"8px",background:c.red,color:"#FFF",fontSize:11}}>Remove</button>
              <button onClick={()=>setConfirmDel(null)} style={{...s,flex:1,padding:"8px",background:c.surface,color:c.textMid,fontSize:11,border:`1px solid ${c.border}`}}>Keep</button>
            </div>:<button onClick={()=>setConfirmDel(m.id)} style={{...s,position:"absolute",top:8,right:8,background:"none",color:c.textFt,fontSize:11,padding:"4px 8px"}}>✕</button>}
          </div>)}

          {/* Add meal manually */}
          {!showAddMeal&&!showFinder&&<div style={{display:"flex",gap:6,marginTop:4}}>
            <button onClick={()=>setShowAddMeal(true)} style={{...s,flex:1,padding:"12px",background:c.surface,color:c.accent,border:`1.5px dashed ${c.accent}`,borderRadius:12,fontSize:12}}>+ Add manually</button>
            <button onClick={()=>setShowFinder(true)} style={{...s,flex:1,padding:"12px",background:c.accent,color:"#FFF",borderRadius:12,fontSize:12}}>🔍 Find me a meal</button>
          </div>}

          {showAddMeal&&<div style={{background:c.surface,borderRadius:12,padding:14,marginTop:4,border:`1px solid ${c.border}`}}>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <input value={newMealEmoji} onChange={e=>setNewMealEmoji(e.target.value)} placeholder="🍽️" style={{...inp,width:50,textAlign:"center"}}/>
              <input value={newMealName} onChange={e=>setNewMealName(e.target.value)} placeholder="Meal name..." style={{...inp,flex:1}}/>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={addMealForm} style={{...s,flex:1,padding:"10px",background:c.accent,color:"#FFF",fontSize:12}}>Add</button>
              <button onClick={()=>setShowAddMeal(false)} style={{...s,padding:"10px 14px",background:c.surface,color:c.textMid,fontSize:12,border:`1px solid ${c.border}`}}>Cancel</button>
            </div>
          </div>}

          {/* AI MEAL FINDER */}
          {showFinder&&<div style={{background:c.surface,borderRadius:14,padding:16,marginTop:4,border:`2px solid ${c.accent}`}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>🔍 Find a New Slow Cooker Meal</div>
            <div style={{fontSize:12,color:c.textDim,marginBottom:10,lineHeight:1.5}}>Describe what you're in the mood for, or paste a recipe URL. It'll build the meal card for you.</div>
            <textarea value={finderQuery} onChange={e=>setFinderQuery(e.target.value)} placeholder={"e.g. \"something with chicken and potatoes\"\nor \"I want a creamy pasta thing\"\nor paste a recipe URL"} rows={3} style={{...inp,width:"100%",resize:"none",boxSizing:"border-box",marginBottom:8}}/>
            <div style={{display:"flex",gap:6}}>
              <button onClick={findMeal} disabled={finderLoading} style={{...s,flex:1,padding:"12px",background:finderLoading?"#999":c.accent,color:"#FFF",fontSize:13}}>{finderLoading?"Searching...":"Find Meal"}</button>
              <button onClick={()=>{setShowFinder(false);setFinderResult(null);setFinderError("");}} style={{...s,padding:"12px 14px",background:c.surface,color:c.textMid,fontSize:12,border:`1px solid ${c.border}`}}>Cancel</button>
            </div>
            {finderError&&<div style={{marginTop:8,fontSize:12,color:c.red}}>{finderError}</div>}
            {finderResult&&<div style={{marginTop:12,background:c.accentBg,borderRadius:12,padding:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:28}}>{finderResult.emoji}</span>
                <div><div style={{fontSize:14,fontWeight:700}}>{finderResult.name}</div><div style={{fontSize:11,color:c.textDim}}>{finderResult.desc}</div></div>
              </div>
              <div style={{fontSize:12,color:c.textMid,marginBottom:4}}>
                {finderResult.ingredients?.length||0} ingredients · {finderResult.steps?.length||0} steps · {finderResult.protein} protein
              </div>
              <div style={{fontSize:11,color:c.textDim,marginBottom:8}}>
                Ingredients: {finderResult.ingredients?.map(i=>i.item).join(", ")}
              </div>
              <button onClick={addFoundMeal} style={{...s,width:"100%",padding:"10px",background:c.green,color:"#FFF",fontSize:13,borderRadius:8}}>✅ Add to my meals</button>
            </div>}
          </div>}
        </>}

        {/* RECIPE */}
        {view==="meals"&&recipe&&(()=>{
          const m=meals.find(x=>x.id===recipe);if(!m)return null;
          return <>
            <button onClick={()=>setRecipe(null)} style={{...s,background:"none",color:c.accent,padding:"0 0 10px",fontSize:13}}>← Back</button>
            <div style={{background:c.surface,borderRadius:16,padding:18,border:`1px solid ${c.border}`}}>
              <div style={{textAlign:"center",marginBottom:12}}>
                <span style={{fontSize:44}}>{m.emoji}</span>
                <h2 style={{fontSize:20,fontWeight:800,margin:"6px 0 2px"}}>{m.name}</h2>
                <p style={{fontSize:12,color:c.textDim,margin:0}}>{m.desc}</p>
                <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:8,flexWrap:"wrap"}}>
                  {pill(c.greenBg,c.green,`${m.protein} protein`)}
                  {pill(c.accentBg,c.accent,`⏱ ${m.cookTime}`)}
                  {pill("#FFF8E1",c.warm,`Serves ${m.servings}`)}
                </div>
              </div>
              <div style={{marginTop:16}}>
                <div style={{fontSize:11,fontWeight:700,color:c.accent,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Ingredients</div>
                {m.ingredients.map((ing,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${c.borderLt}`,fontSize:13}}><span>{ing.item}</span><span style={{color:c.textDim,fontSize:12}}>{ing.qty}</span></div>)}
              </div>
              <div style={{marginTop:16}}>
                <div style={{fontSize:11,fontWeight:700,color:c.accent,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Steps</div>
                {m.steps.map((st,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,fontSize:13,lineHeight:1.5}}>
                  <div style={{minWidth:22,height:22,borderRadius:6,background:c.accentBg,color:c.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{i+1}</div>
                  <span style={{color:c.textMid}}>{st}</span>
                </div>)}
              </div>
              <div style={{marginTop:12,background:c.greenBg,borderRadius:8,padding:8,fontSize:11,color:c.green,textAlign:"center"}}>🥬 {m.veggies}</div>
            </div>
          </>;
        })()}

        {/* ═══ MANAGE ═══ */}
        {view==="manage"&&<>
          <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>⚙️ Manage</div>

          {/* Store selector */}
          <div style={{background:c.surface,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${c.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:c.accent,marginBottom:8}}>🏪 Your Store</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {STORES.map(st=><button key={st.id} onClick={()=>setStoreId(st.id)} style={{...s,padding:"8px 14px",fontSize:12,background:storeId===st.id?st.badge:"transparent",color:storeId===st.id?st.badgeText:c.textMid,border:`1.5px solid ${storeId===st.id?st.badge:c.border}`,borderRadius:8}}>{st.name}</button>)}
            </div>
          </div>

          {/* Weekly essentials */}
          <div style={{background:c.surface,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${c.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:c.accent,marginBottom:8}}>📦 Always Buy (weekly essentials)</div>
            {weeklyItems.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${c.borderLt}`,fontSize:13}}>
              <span style={{flex:1}}>{item.item} <span style={{color:c.textDim,fontSize:11}}>({item.qty})</span></span>
              <button onClick={()=>rmWeekly(i)} style={{...s,background:"none",color:c.textFt,fontSize:12,padding:"2px 6px"}}>✕</button>
            </div>)}
            {!showAddW?<button onClick={()=>setShowAddW(true)} style={{...s,width:"100%",padding:"8px",marginTop:8,background:"transparent",color:c.accent,border:`1px dashed ${c.accent}`,fontSize:12}}>+ Add permanent item</button>
            :<div style={{marginTop:8}}>
              <div style={{display:"flex",gap:4,marginBottom:6}}><input value={newWI} onChange={e=>setNewWI(e.target.value)} placeholder="Item..." style={{...inp,flex:1}}/><input value={newWQ} onChange={e=>setNewWQ(e.target.value)} placeholder="Qty" style={{...inp,width:70}}/></div>
              <div style={{display:"flex",gap:4}}><button onClick={addWeekly} style={{...s,flex:1,padding:"8px",background:c.accent,color:"#FFF",fontSize:12}}>Add</button><button onClick={()=>setShowAddW(false)} style={{...s,padding:"8px 12px",background:c.surface,color:c.textMid,fontSize:12,border:`1px solid ${c.border}`}}>Cancel</button></div>
            </div>}
          </div>

          {/* Household cats */}
          <div style={{background:c.surface,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${c.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:c.accent,marginBottom:8}}>✅ Check Categories</div>
            {householdCats.map((cat,ci)=><div key={ci} style={{marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${c.borderLt}`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:600,color:c.textMid}}>{cat.name}</span><button onClick={()=>rmCat(ci)} style={{...s,background:"none",color:c.textFt,fontSize:11,padding:"2px 6px"}}>remove</button></div>
              <div style={{fontSize:11,color:c.textDim,marginTop:2}}>{cat.items.join(", ")}</div>
              <div style={{display:"flex",gap:4,marginTop:6}}>
                <input id={`c${ci}`} placeholder="+ add" style={{...inp,flex:1,fontSize:11,padding:"6px 8px"}}/>
                <button onClick={()=>{const el=document.getElementById(`c${ci}`);addToCat(ci,el.value);el.value="";}} style={{...s,padding:"6px 10px",background:c.accent,color:"#FFF",fontSize:11}}>+</button>
              </div>
            </div>)}
            {!showAddCat?<button onClick={()=>setShowAddCat(true)} style={{...s,width:"100%",padding:"8px",background:"transparent",color:c.accent,border:`1px dashed ${c.accent}`,fontSize:12}}>+ New category</button>
            :<div style={{marginTop:4}}>
              <input value={newCN} onChange={e=>setNewCN(e.target.value)} placeholder="Category (e.g. 🏠 Home Office)" style={{...inp,width:"100%",marginBottom:6}}/>
              <input value={newCI} onChange={e=>setNewCI(e.target.value)} placeholder="First item" style={{...inp,width:"100%",marginBottom:6}}/>
              <div style={{display:"flex",gap:4}}><button onClick={addCat} style={{...s,flex:1,padding:"8px",background:c.accent,color:"#FFF",fontSize:12}}>Create</button><button onClick={()=>setShowAddCat(false)} style={{...s,padding:"8px 12px",background:c.surface,color:c.textMid,fontSize:12,border:`1px solid ${c.border}`}}>Cancel</button></div>
            </div>}
          </div>

          {/* Logo */}
          <div style={{background:c.surface,borderRadius:14,padding:14,border:`1px solid ${c.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:c.accent,marginBottom:8}}>🎨 Custom Logo</div>
            <div style={{display:"flex",gap:6}}>
              <input value={headerImg} onChange={e=>setHeaderImg(e.target.value)} placeholder="https://your-image.png" style={{...inp,flex:1}}/>
              {headerImg&&<button onClick={()=>setHeaderImg("")} style={{...s,padding:"8px 12px",background:c.redBg,color:c.red,fontSize:11}}>Reset</button>}
            </div>
          </div>
        </>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",maxWidth:500,width:"100%",background:"rgba(240,240,242,.92)",backdropFilter:"blur(10px)",borderTop:`1px solid ${c.border}`,padding:"8px 16px",textAlign:"center",fontSize:10,color:c.textFt}}>
        Crock N' Roll{userName?` · ${userName}`:""} · {store.name}
      </div>
    </div>
  );
}
