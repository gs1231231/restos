'use client';

import { useState } from 'react';

/* ───── Types ───── */
type FoodType = 'VEG' | 'NONVEG' | 'EGG';
type Station = 'HOT' | 'COLD' | 'BAR' | 'TANDOOR';
type MenuTab = 'Categories' | 'Items' | 'Modifiers' | 'Combos';

interface Category { id: string; name: string; icon: string; itemCount: number; sortOrder: number; active: boolean }
interface MenuItem {
  id: string; name: string; description: string; category: string; price: number; mrp: number;
  taxRate: number; foodType: FoodType; prepTime: number; station: Station;
  available: boolean; popular: boolean;
}

/* ───── Sample Data ───── */
const ICONS = ['🍛','🍗','🥘','🍞','🥗','🍹','🍰','🫕','🥩','🧆','🍲','🍜'];

const INITIAL_CATEGORIES: Category[] = [
  { id:'c1', name:'Starters', icon:'🧆', itemCount:8, sortOrder:1, active:true },
  { id:'c2', name:'Main Course', icon:'🍛', itemCount:10, sortOrder:2, active:true },
  { id:'c3', name:'Breads', icon:'🍞', itemCount:5, sortOrder:3, active:true },
  { id:'c4', name:'Rice & Biryani', icon:'🍚', itemCount:4, sortOrder:4, active:true },
  { id:'c5', name:'Tandoor', icon:'🥩', itemCount:5, sortOrder:5, active:true },
  { id:'c6', name:'Beverages', icon:'🍹', itemCount:4, sortOrder:6, active:true },
  { id:'c7', name:'Desserts', icon:'🍰', itemCount:3, sortOrder:7, active:true },
  { id:'c8', name:'Soups', icon:'🍜', itemCount:2, sortOrder:8, active:true },
];

const INITIAL_ITEMS: MenuItem[] = [
  { id:'i1', name:'Paneer Tikka', description:'Marinated cottage cheese grilled in tandoor', category:'Starters', price:320, mrp:350, taxRate:5, foodType:'VEG', prepTime:15, station:'TANDOOR', available:true, popular:true },
  { id:'i2', name:'Chicken Tikka', description:'Boneless chicken marinated with spices & yogurt', category:'Starters', price:360, mrp:380, taxRate:5, foodType:'NONVEG', prepTime:18, station:'TANDOOR', available:true, popular:true },
  { id:'i3', name:'Fish Amritsari', description:'Crispy fried fish with ajwain & besan batter', category:'Starters', price:380, mrp:400, taxRate:5, foodType:'NONVEG', prepTime:15, station:'HOT', available:true, popular:false },
  { id:'i4', name:'Veg Spring Roll', description:'Crispy rolls stuffed with vegetables', category:'Starters', price:220, mrp:250, taxRate:5, foodType:'VEG', prepTime:10, station:'HOT', available:true, popular:false },
  { id:'i5', name:'Hara Bhara Kebab', description:'Spinach & green pea patties', category:'Starters', price:260, mrp:280, taxRate:5, foodType:'VEG', prepTime:12, station:'HOT', available:true, popular:false },
  { id:'i6', name:'Egg Devil', description:'Stuffed boiled eggs deep fried', category:'Starters', price:200, mrp:220, taxRate:5, foodType:'EGG', prepTime:10, station:'HOT', available:true, popular:false },
  { id:'i7', name:'Mutton Seekh Kebab', description:'Minced mutton skewers grilled on charcoal', category:'Starters', price:420, mrp:450, taxRate:5, foodType:'NONVEG', prepTime:20, station:'TANDOOR', available:true, popular:true },
  { id:'i8', name:'Dahi Kebab', description:'Soft hung curd kebabs', category:'Starters', price:280, mrp:300, taxRate:5, foodType:'VEG', prepTime:12, station:'TANDOOR', available:false, popular:false },
  { id:'i9', name:'Butter Chicken', description:'Tandoori chicken in rich tomato-butter gravy', category:'Main Course', price:380, mrp:400, taxRate:5, foodType:'NONVEG', prepTime:20, station:'HOT', available:true, popular:true },
  { id:'i10', name:'Kadhai Paneer', description:'Paneer with bell peppers in kadhai masala', category:'Main Course', price:300, mrp:320, taxRate:5, foodType:'VEG', prepTime:15, station:'HOT', available:true, popular:true },
  { id:'i11', name:'Dal Makhani', description:'Slow cooked black lentils in butter & cream', category:'Main Course', price:280, mrp:300, taxRate:5, foodType:'VEG', prepTime:10, station:'HOT', available:true, popular:true },
  { id:'i12', name:'Mutton Rogan Josh', description:'Kashmiri style mutton in aromatic gravy', category:'Main Course', price:450, mrp:480, taxRate:5, foodType:'NONVEG', prepTime:25, station:'HOT', available:true, popular:false },
  { id:'i13', name:'Palak Paneer', description:'Cottage cheese in spinach gravy', category:'Main Course', price:280, mrp:300, taxRate:5, foodType:'VEG', prepTime:15, station:'HOT', available:true, popular:false },
  { id:'i14', name:'Egg Curry', description:'Boiled eggs in onion tomato masala', category:'Main Course', price:240, mrp:260, taxRate:5, foodType:'EGG', prepTime:15, station:'HOT', available:true, popular:false },
  { id:'i15', name:'Malai Kofta', description:'Paneer & potato dumplings in cashew gravy', category:'Main Course', price:300, mrp:320, taxRate:5, foodType:'VEG', prepTime:20, station:'HOT', available:true, popular:false },
  { id:'i16', name:'Prawn Curry', description:'Prawns cooked in coconut gravy', category:'Main Course', price:420, mrp:450, taxRate:5, foodType:'NONVEG', prepTime:18, station:'HOT', available:true, popular:false },
  { id:'i17', name:'Chole Masala', description:'Chickpeas in tangy onion-tomato gravy', category:'Main Course', price:240, mrp:260, taxRate:5, foodType:'VEG', prepTime:12, station:'HOT', available:true, popular:false },
  { id:'i18', name:'Fish Curry', description:'Fish in mustard-turmeric gravy', category:'Main Course', price:380, mrp:400, taxRate:5, foodType:'NONVEG', prepTime:18, station:'HOT', available:false, popular:false },
  { id:'i19', name:'Butter Naan', description:'Refined flour bread with butter', category:'Breads', price:60, mrp:70, taxRate:5, foodType:'VEG', prepTime:5, station:'TANDOOR', available:true, popular:true },
  { id:'i20', name:'Garlic Naan', description:'Naan topped with garlic & coriander', category:'Breads', price:70, mrp:80, taxRate:5, foodType:'VEG', prepTime:5, station:'TANDOOR', available:true, popular:false },
  { id:'i21', name:'Tandoori Roti', description:'Whole wheat bread baked in tandoor', category:'Breads', price:40, mrp:50, taxRate:5, foodType:'VEG', prepTime:4, station:'TANDOOR', available:true, popular:false },
  { id:'i22', name:'Rumali Roti', description:'Paper thin soft bread', category:'Breads', price:50, mrp:60, taxRate:5, foodType:'VEG', prepTime:4, station:'TANDOOR', available:true, popular:false },
  { id:'i23', name:'Laccha Paratha', description:'Layered flaky bread', category:'Breads', price:60, mrp:70, taxRate:5, foodType:'VEG', prepTime:6, station:'TANDOOR', available:true, popular:false },
  { id:'i24', name:'Chicken Biryani', description:'Hyderabadi dum biryani with raita', category:'Rice & Biryani', price:350, mrp:380, taxRate:5, foodType:'NONVEG', prepTime:25, station:'HOT', available:true, popular:true },
  { id:'i25', name:'Veg Biryani', description:'Aromatic rice with seasonal vegetables', category:'Rice & Biryani', price:280, mrp:300, taxRate:5, foodType:'VEG', prepTime:20, station:'HOT', available:true, popular:false },
  { id:'i26', name:'Jeera Rice', description:'Cumin tempered basmati rice', category:'Rice & Biryani', price:180, mrp:200, taxRate:5, foodType:'VEG', prepTime:10, station:'HOT', available:true, popular:false },
  { id:'i27', name:'Egg Biryani', description:'Spiced rice with boiled eggs', category:'Rice & Biryani', price:280, mrp:300, taxRate:5, foodType:'EGG', prepTime:20, station:'HOT', available:true, popular:false },
  { id:'i28', name:'Tandoori Chicken', description:'Half chicken marinated & roasted in tandoor', category:'Tandoor', price:380, mrp:400, taxRate:5, foodType:'NONVEG', prepTime:25, station:'TANDOOR', available:true, popular:true },
  { id:'i29', name:'Afghani Chicken', description:'Creamy marinated grilled chicken', category:'Tandoor', price:400, mrp:420, taxRate:5, foodType:'NONVEG', prepTime:25, station:'TANDOOR', available:true, popular:false },
  { id:'i30', name:'Paneer Tikka Platter', description:'Assorted paneer tikka with chutneys', category:'Tandoor', price:350, mrp:380, taxRate:5, foodType:'VEG', prepTime:18, station:'TANDOOR', available:true, popular:false },
  { id:'i31', name:'Sweet Lassi', description:'Chilled yogurt drink with cardamom', category:'Beverages', price:90, mrp:100, taxRate:12, foodType:'VEG', prepTime:3, station:'COLD', available:true, popular:false },
  { id:'i32', name:'Masala Chaas', description:'Spiced buttermilk', category:'Beverages', price:70, mrp:80, taxRate:12, foodType:'VEG', prepTime:3, station:'COLD', available:true, popular:false },
  { id:'i33', name:'Fresh Lime Soda', description:'Lemon soda, sweet or salty', category:'Beverages', price:80, mrp:90, taxRate:12, foodType:'VEG', prepTime:2, station:'BAR', available:true, popular:false },
  { id:'i34', name:'Mango Lassi', description:'Thick mango yogurt smoothie', category:'Beverages', price:110, mrp:120, taxRate:12, foodType:'VEG', prepTime:3, station:'COLD', available:true, popular:true },
  { id:'i35', name:'Gulab Jamun', description:'Deep fried milk dumplings in sugar syrup', category:'Desserts', price:120, mrp:140, taxRate:5, foodType:'VEG', prepTime:2, station:'COLD', available:true, popular:true },
  { id:'i36', name:'Rasmalai', description:'Soft paneer discs in saffron milk', category:'Desserts', price:140, mrp:160, taxRate:5, foodType:'VEG', prepTime:2, station:'COLD', available:true, popular:false },
  { id:'i37', name:'Kulfi', description:'Traditional Indian ice cream', category:'Desserts', price:100, mrp:120, taxRate:5, foodType:'VEG', prepTime:1, station:'COLD', available:true, popular:false },
  { id:'i38', name:'Tomato Shorba', description:'Spiced tomato soup', category:'Soups', price:160, mrp:180, taxRate:5, foodType:'VEG', prepTime:8, station:'HOT', available:true, popular:false },
  { id:'i39', name:'Chicken Shorba', description:'Clear chicken soup with spices', category:'Soups', price:200, mrp:220, taxRate:5, foodType:'NONVEG', prepTime:10, station:'HOT', available:true, popular:false },
];

const FOOD_DOT: Record<FoodType, string> = { VEG: '#22c55e', NONVEG: '#ef4444', EGG: '#f59e0b' };
const STATION_COLORS: Record<Station, string> = { HOT: '#ef4444', COLD: '#3b82f6', BAR: '#8b5cf6', TANDOOR: '#f97316' };

export default function MenuPage() {
  const [tab, setTab] = useState<MenuTab>('Items');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [items, setItems] = useState<MenuItem[]>(INITIAL_ITEMS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [foodFilter, setFoodFilter] = useState<FoodType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  /* form state */
  const emptyForm: MenuItem = { id:'', name:'', description:'', category:'Starters', price:0, mrp:0, taxRate:5, foodType:'VEG', prepTime:10, station:'HOT', available:true, popular:false };
  const [form, setForm] = useState<MenuItem>(emptyForm);

  const emptyCatForm: Category = { id:'', name:'', icon:'🍛', itemCount:0, sortOrder:categories.length + 1, active:true };
  const [catForm, setCatForm] = useState<Category>(emptyCatForm);

  const filteredItems = items.filter(it => {
    if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'All' && it.category !== catFilter) return false;
    if (foodFilter !== 'ALL' && it.foodType !== foodFilter) return false;
    return true;
  });

  const openAdd = () => { setEditItem(null); setForm({ ...emptyForm, id: `i${Date.now()}` }); setShowModal(true); };
  const openEdit = (it: MenuItem) => { setEditItem(it); setForm({ ...it }); setShowModal(true); };
  const saveItem = () => {
    if (editItem) { setItems(prev => prev.map(i => i.id === editItem.id ? form : i)); }
    else { setItems(prev => [...prev, form]); }
    setShowModal(false);
  };

  const openAddCat = () => { setEditCat(null); setCatForm({ ...emptyCatForm, id: `c${Date.now()}` }); setShowCatModal(true); };
  const openEditCat = (c: Category) => { setEditCat(c); setCatForm({ ...c }); setShowCatModal(true); };
  const saveCat = () => {
    if (editCat) { setCategories(prev => prev.map(c => c.id === editCat.id ? catForm : c)); }
    else { setCategories(prev => [...prev, catForm]); }
    setShowCatModal(false);
  };
  const deleteCat = (id: string) => { setCategories(prev => prev.filter(c => c.id !== id)); };

  const toggleAvail = (id: string) => { setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i)); };
  const bulkToggle = (avail: boolean) => {
    setItems(prev => prev.map(i => selectedItems.has(i.id) ? { ...i, available: avail } : i));
    setSelectedItems(new Set());
  };
  const toggleSelect = (id: string) => {
    setSelectedItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const selectAll = () => {
    if (selectedItems.size === filteredItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(filteredItems.map(i => i.id)));
  };

  const moveCategory = (id: string, dir: -1 | 1) => {
    setCategories(prev => {
      const arr = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = arr.findIndex(c => c.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      const tmp = arr[idx]!.sortOrder;
      arr[idx] = { ...arr[idx]!, sortOrder: arr[swapIdx]!.sortOrder };
      arr[swapIdx] = { ...arr[swapIdx]!, sortOrder: tmp };
      return arr;
    });
  };

  const TABS: MenuTab[] = ['Categories', 'Items', 'Modifiers', 'Combos'];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Menu Management</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1e293b' : '#64748b',
            boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      {/* ──── CATEGORIES TAB ──── */}
      {tab === 'Categories' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Categories ({categories.length})</span>
            <button onClick={openAddCat} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>+ Add Category</button>
          </div>
          {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map(cat => (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', gap: 12,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, cursor: 'grab' }}>
                <button onClick={() => moveCategory(cat.id, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 10, padding: 0, lineHeight: 1 }}>&#9650;</button>
                <button onClick={() => moveCategory(cat.id, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 10, padding: 0, lineHeight: 1 }}>&#9660;</button>
              </div>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{items.filter(i => i.category === cat.name).length} items</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEditCat(cat)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#475569' }}>Edit</button>
                <button onClick={() => deleteCat(cat.id)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──── ITEMS TAB ──── */}
      {tab === 'Items' && (
        <>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, width: 220, outline: 'none',
            }} />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff',
            }}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['ALL', 'VEG', 'NONVEG', 'EGG'] as const).map(f => (
                <button key={f} onClick={() => setFoodFilter(f)} style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: foodFilter === f ? (f === 'ALL' ? '#1e293b' : FOOD_DOT[f as FoodType]) : '#fff',
                  color: foodFilter === f ? '#fff' : '#64748b',
                }}>{f}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            {selectedItems.size > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => bulkToggle(true)} style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>Enable ({selectedItems.size})</button>
                <button onClick={() => bulkToggle(false)} style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>Disable ({selectedItems.size})</button>
              </div>
            )}
            <button onClick={openAdd} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>+ Add Item</button>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>
                    <input type="checkbox" checked={selectedItems.size === filteredItems.length && filteredItems.length > 0} onChange={selectAll} />
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Category</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Price</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Type</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Available</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Station</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(it => (
                  <tr key={it.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <input type="checkbox" checked={selectedItems.has(it.id)} onChange={() => toggleSelect(it.id)} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{it.name}</div>
                        {it.popular && <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>Popular</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{it.description}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{it.category}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>Rs {it.price}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', width: 14, height: 14, borderRadius: 3,
                        border: `2px solid ${FOOD_DOT[it.foodType]}`, position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                          width: 6, height: 6, borderRadius: '50%', background: FOOD_DOT[it.foodType],
                        }} />
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button onClick={() => toggleAvail(it.id)} style={{
                        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative',
                        background: it.available ? '#10b981' : '#d1d5db', transition: 'background 0.2s',
                      }}>
                        <span style={{
                          position: 'absolute', top: 2, left: it.available ? 20 : 2, width: 18, height: 18, borderRadius: '50%',
                          background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: STATION_COLORS[it.station] + '18', color: STATION_COLORS[it.station],
                      }}>{it.station}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button onClick={() => openEdit(it)} style={{
                        padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#475569',
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No items found</div>
            )}
          </div>
        </>
      )}

      {/* ──── MODIFIERS TAB ──── */}
      {tab === 'Modifiers' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Modifier Groups</div>
          {[
            { name: 'Spice Level', options: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'], price: 0 },
            { name: 'Extra Toppings', options: ['Cheese (+Rs 30)', 'Paneer (+Rs 40)', 'Mushroom (+Rs 30)'], price: 30 },
            { name: 'Portion Size', options: ['Half (-Rs 50)', 'Full', 'Family Pack (+Rs 100)'], price: 0 },
            { name: 'Add-ons', options: ['Extra Gravy (+Rs 20)', 'Butter (+Rs 15)', 'Cream (+Rs 20)'], price: 20 },
          ].map((g, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>{g.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {g.options.map((o, j) => (
                  <span key={j} style={{ padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', fontSize: 12, color: '#475569' }}>{o}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──── COMBOS TAB ──── */}
      {tab === 'Combos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { name: 'Couple Meal', items: ['Butter Chicken', 'Kadhai Paneer', 'Butter Naan x4', 'Jeera Rice', 'Gulab Jamun x2'], price: 899, mrp: 1100 },
            { name: 'Family Thali', items: ['Dal Makhani', 'Palak Paneer', 'Chole Masala', 'Raita', 'Tandoori Roti x6', 'Jeera Rice', 'Gulab Jamun x4'], price: 1299, mrp: 1600 },
            { name: 'Non-Veg Feast', items: ['Chicken Tikka', 'Butter Chicken', 'Chicken Biryani', 'Butter Naan x4', 'Rasmalai x2'], price: 1499, mrp: 1850 },
            { name: 'Lunch Special', items: ['Dal Makhani', 'Tandoori Roti x3', 'Jeera Rice', 'Sweet Lassi'], price: 399, mrp: 530 },
          ].map((combo, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{combo.name}</span>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>
                  {Math.round((1 - combo.price / combo.mrp) * 100)}% OFF
                </span>
              </div>
              {combo.items.map((it, j) => (
                <div key={j} style={{ fontSize: 12, color: '#475569', padding: '3px 0' }}>- {it}</div>
              ))}
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Rs {combo.price}</span>
                <span style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'line-through' }}>Rs {combo.mrp}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──── ITEM MODAL ──── */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 560, maxHeight: '90vh', overflowY: 'auto',
            background: '#fff', borderRadius: 16, boxShadow: '0 24px 48px rgba(0,0,0,0.15)', zIndex: 101, padding: 28,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{editItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>X</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Food Type</label>
                <select style={inputStyle} value={form.foodType} onChange={e => setForm({ ...form, foodType: e.target.value as FoodType })}>
                  <option value="VEG">VEG</option><option value="NONVEG">NON-VEG</option><option value="EGG">EGG</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Price (Rs)</label>
                <input type="number" style={inputStyle} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>MRP (Rs)</label>
                <input type="number" style={inputStyle} value={form.mrp} onChange={e => setForm({ ...form, mrp: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Tax Rate (%)</label>
                <input type="number" style={inputStyle} value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Prep Time (min)</label>
                <input type="number" style={inputStyle} value={form.prepTime} onChange={e => setForm({ ...form, prepTime: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Station</label>
                <select style={inputStyle} value={form.station} onChange={e => setForm({ ...form, station: e.target.value as Station })}>
                  <option value="HOT">HOT</option><option value="COLD">COLD</option><option value="BAR">BAR</option><option value="TANDOOR">TANDOOR</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Image Upload</label>
                <div style={{
                  border: '2px dashed #e2e8f0', borderRadius: 8, padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: 12, cursor: 'pointer',
                }}>Click to upload image</div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} /> Available
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })} /> Popular
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#475569',
              }}>Cancel</button>
              <button onClick={saveItem} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Save Item</button>
            </div>
          </div>
        </>
      )}

      {/* ──── CATEGORY MODAL ──── */}
      {showCatModal && (
        <>
          <div onClick={() => setShowCatModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400,
            background: '#fff', borderRadius: 16, boxShadow: '0 24px 48px rgba(0,0,0,0.15)', zIndex: 101, padding: 28,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>{editCat ? 'Edit Category' : 'Add Category'}</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Icon</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setCatForm({ ...catForm, icon: ic })} style={{
                    width: 36, height: 36, borderRadius: 8, border: catForm.icon === ic ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    background: catForm.icon === ic ? '#eef2ff' : '#fff', fontSize: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCatModal(false)} style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#475569',
              }}>Cancel</button>
              <button onClick={saveCat} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
