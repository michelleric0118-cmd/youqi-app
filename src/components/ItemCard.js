function ItemCard({ item, updateItem, deleteItem }) {
  const handleUseOne = async () => {
    if (item.quantity > 0) {
      await updateItem(item.id, { quantity: item.quantity - 1 });
      // Toast 已在 updateItem 里弹出
    }
  };

  const handleDelete = async () => {
    await deleteItem(item.id);
    // Toast 已在 deleteItem 里弹出
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
        <span className="text-sm font-semibold text-green-600">
          {item.expiryDate ? `${item.expiryDate} 到期` : '无到期'}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        <span>{item.brand || '无品牌'}</span>
        <span className="mx-2">|</span>
        <span>{item.category || '未分类'}</span>
      </div>
      <div className="text-xs text-gray-400 pt-2">
        <p>数量: {item.quantity ?? 0}</p>
        {item.notes && <p>备注: {item.notes}</p>}
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        {item.quantity > 0 && (
          <button
            onClick={handleUseOne}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
          >
            -1
          </button>
        )}
        <button className="text-xs">编辑</button>
        <button className="text-xs text-red-600" onClick={handleDelete}>删除</button>
      </div>
    </div>
  );
}