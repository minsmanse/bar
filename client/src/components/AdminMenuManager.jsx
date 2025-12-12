import React, { useState, useEffect } from 'react';
import api from '../api';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus, Save, X, Trash2, Image as ImageIcon } from 'lucide-react';
import CompositionChart from './CompositionChart';

// --- Draggable Ingredient Card ---
function DraggableIngredient({ ingredient, onDelete }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ingredient.id,
    data: ingredient,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="group relative flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition hover:border-indigo-300"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {ingredient.image ? (
          <img src={ingredient.image} alt={ingredient.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-800 truncate">{ingredient.name}</div>
        <div className="text-xs text-indigo-600 font-semibold">{ingredient.abv}% ABV</div>
      </div>
      {/* 삭제 버튼은 호버 시에만 보이게 함 */}
      <button 
        onPointerDown={(e) => { e.stopPropagation(); onDelete(ingredient.id); }}
        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition"
        aria-label={`${ingredient.name} 삭제`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// --- 믹싱 볼 영역 ---
function MixingBowl({ items, onRemove, onUpdateVolume, totalVolume }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'mixing-bowl',
  });

  return (
    <div className="flex gap-4 h-full">
      {/* 리스트 영역 */}
      <div 
        ref={setNodeRef}
        className={`flex-1 min-h-[300px] border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${isOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 bg-gray-50/50'}`}
      >
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
            <div className="mb-2 p-4 bg-gray-100 rounded-full">
              <Plus size={32} className="text-gray-300" />
            </div>
            <p className="font-medium">여기로 재료를 드래그하세요</p>
            <p className="text-sm">믹싱을 시작하려면</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={14} /></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-800 block leading-tight">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.abv}% ABV</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <input
                    type="number"
                    placeholder="30"
                    className="w-12 bg-transparent text-right font-mono font-bold focus:outline-none"
                    value={item.volume || ''}
                    onChange={(e) => onUpdateVolume(idx, e.target.value)}
                    aria-label={`${item.name} 용량`}
                  />
                  <span className="text-xs text-gray-500 font-medium pr-1">ml</span>
                </div>
                <button onClick={() => onRemove(idx)} className="text-gray-400 hover:text-red-500 p-1" aria-label={`${item.name} 제거`}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 시각적 차트 영역 */}
      <div className="w-40 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center shadow-sm">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">구성</h4>
        <CompositionChart items={items} totalVolume={totalVolume} height={200} />
      </div>
    </div>
  );
}

export default function AdminMenuManager() {
  const [ingredients, setIngredients] = useState([]);
  const [mixItems, setMixItems] = useState([]);
  
  // 재료 폼 상태
  const [newIng, setNewIng] = useState({ name: '', abv: 0, image: '' });
  const [isIngFormOpen, setIsIngFormOpen] = useState(false);

  // 메뉴 폼 상태
  const [menuName, setMenuName] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuImage, setMenuImage] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    const res = await api.get('/api/ingredients');
    setIngredients(res.data);
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIng.name) return;
    await api.post('/api/ingredients', newIng);
    setNewIng({ name: '', abv: 0, image: '' });
    setIsIngFormOpen(false);
    fetchIngredients();
  };

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm('정말 이 재료를 삭제하시겠습니까?')) return;
    
    try {
      await api.delete(`/api/ingredients/${id}`);
      setIngredients(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      alert('재료 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id === 'mixing-bowl') {
      const addedItem = { ...active.data.current, volume: 30 }; 
      setMixItems([...mixItems, addedItem]);
    }
  };

  const updateVolume = (index, vol) => {
    const newItems = [...mixItems];
    newItems[index].volume = Number(vol);
    setMixItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...mixItems];
    newItems.splice(index, 1);
    setMixItems(newItems);
  };

  const totalVolume = mixItems.reduce((acc, item) => acc + (item.volume || 0), 0);
  const totalAlcohol = mixItems.reduce((acc, item) => acc + ((item.volume || 0) * (item.abv / 100)), 0);
  const finalAbv = totalVolume > 0 ? (totalAlcohol / totalVolume) * 100 : 0;

  const saveMenu = async () => {
    if (!menuName || mixItems.length === 0) return;
    const menuData = {
      name: menuName,
      description: menuDesc,
      image: menuImage,
      items: mixItems,
      finalAbv: parseFloat(finalAbv.toFixed(1)),
      totalVolume
    };
    await api.post('/api/menu', menuData);
    alert('메뉴가 성공적으로 생성되었습니다!');
    setMixItems([]);
    setMenuName('');
    setMenuDesc('');
    setMenuImage('');
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* === 왼쪽 패널: 재료 라이브러리 === */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-gray-50 p-4 rounded-2xl h-full overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-lg">재료 창고</h3>
            <button 
              onClick={() => setIsIngFormOpen(!isIngFormOpen)}
              className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              {isIngFormOpen ? '닫기' : '+ 새 재료'}
            </button>
          </div>

          {isIngFormOpen && (
            <form onSubmit={handleAddIngredient} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2">
              <input 
                className="w-full p-2 border rounded-lg text-sm" 
                placeholder="이름 (예: 위스키)" 
                value={newIng.name} 
                onChange={e => setNewIng({...newIng, name: e.target.value})} 
                autoFocus
              />
              <div className="flex gap-2">
                <input 
                  type="number"
                  className="w-24 p-2 border rounded-lg text-sm" 
                  placeholder="도수 %" 
                  value={newIng.abv} 
                  onChange={e => setNewIng({...newIng, abv: Number(e.target.value)})} 
                />
                <input 
                  className="flex-1 p-2 border rounded-lg text-sm" 
                  placeholder="이미지 URL" 
                  value={newIng.image} 
                  onChange={e => setNewIng({...newIng, image: e.target.value})} 
                />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800">재료 추가</button>
            </form>
          )}

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {ingredients.map(ing => (
              <DraggableIngredient key={ing.id} ingredient={ing} onDelete={handleDeleteIngredient} />
            ))}
          </div>
        </div>

        {/* === 오른쪽 패널: 작업대 === */}
        <div className="lg:col-span-7 flex flex-col h-full gap-4">
          
          {/* 믹싱 영역 */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-y-auto">
             <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    믹싱 작업대
                </div>
                {menuImage && (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={menuImage} alt="메뉴 미리보기" className="w-full h-full object-cover" />
                    </div>
                )}
             </h3>
             <MixingBowl items={mixItems} onRemove={removeItem} onUpdateVolume={updateVolume} totalVolume={totalVolume} />
          </div>

          {/* 결과 & 저장 영역 */}
          <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl flex-shrink-0">
             <div className="flex gap-6">
                <div className="flex-1 space-y-3">
                   <input 
                      className="w-full bg-gray-800 border-none rounded-lg px-3 py-2 text-white placeholder-gray-500 font-bold text-lg focus:ring-1 focus:ring-indigo-500"
                      placeholder="칵테일 이름"
                      value={menuName}
                      onChange={e => setMenuName(e.target.value)}
                   />
                   <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-gray-800 border-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                        placeholder="설명"
                        value={menuDesc}
                        onChange={e => setMenuDesc(e.target.value)}
                      />
                      <input 
                        className="w-1/3 bg-gray-800 border-none rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                        placeholder="이미지 URL"
                        value={menuImage}
                        onChange={e => setMenuImage(e.target.value)}
                      />
                   </div>
                </div>

                <div className="text-right min-w-[100px]">
                   <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">ABV</p>
                   <div className="text-4xl font-black text-yellow-400 leading-none">{finalAbv.toFixed(1)}<span className="text-lg text-yellow-600">%</span></div>
                   <p className="text-gray-500 text-xs mt-1">{totalVolume}ml</p>
                </div>
             </div>

             <button 
                onClick={saveMenu}
                disabled={mixItems.length === 0 || !menuName}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition"
             >
                <Save size={18} /> 메뉴 등록
             </button>
          </div>

        </div>

      </div>
    </DndContext>
  );
}