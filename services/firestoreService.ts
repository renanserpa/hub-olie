import { db } from "../lib/firebase";
import {
    getDocs,
    collection,
    doc,
    getDoc,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    writeBatch,
    query,
    where,
    orderBy,
} from "firebase/firestore";

import {
    AnyProduct,
    AppData,
    BasicMaterial,
    Contact,
    InventoryBalance,
    InventoryMovement,
    Order, OrderStatus,
    Product,
    ProductCategory,
    ProductionOrder,
    SettingsCategory,
    SystemSetting,
    Task,
    TaskStatus,
    User
} from "../types";

// --- Generic CRUD Functions ---

export const getCollection = async <T>(path: string): Promise<T[]> => {
  const querySnapshot = await getDocs(collection(db, path));
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as T));
};

export const getDocument = async <T>(path: string, id: string): Promise<T | null> => {
  const docRef = doc(db, path, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
};

export const addDocument = async (path: string, data: any) => {
  const dataWithTimestamp = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, path), dataWithTimestamp);
  return docRef.id;
};

export const updateDocument = async (path: string, id: string, data: any) => {
  const dataWithTimestamp = {
      ...data,
      updated_at: serverTimestamp(),
  };
  const docRef = doc(db, path, id);
  await updateDoc(docRef, dataWithTimestamp);
};

export const deleteDocument = async (path: string, id: string) => {
  await deleteDoc(doc(db, path, id));
};


// --- App-Specific Helper Functions ---

const getSettingsCollectionPath = (category: SettingsCategory, subTab: string | null, subSubTab: string | null): string => {
    if (subSubTab) return subSubTab;
    if (subTab) return subTab;
    return category;
};

const getProductCategories = (): Promise<ProductCategory[]> => getCollection<ProductCategory>('product_categories');

const getProducts = async (): Promise<Product[]> => {
    const products = await getCollection<Product>('products');
    const categories = await getProductCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    return products.map(product => ({
        ...product,
        category: categoryMap.get(product.category_id)
    }));
};

const getOrders = async (): Promise<Order[]> => {
    const orders = await getCollection<Order>('orders');
    const contacts = await getCollection<Contact>('contacts');
    const contactsMap = new Map(contacts.map(c => [c.id, c]));

    const products = await getProducts();
    const productsMap = new Map(products.map(p => [p.id, p]));
    
    return orders.map(order => ({
        ...order,
        contact: contactsMap.get(order.contact_id),
        items: order.items.map(item => ({...item, product: productsMap.get(item.product_id)}))
    }));
};

const getTasks = (): Promise<Task[]> => getCollection<Task>('tasks');
const getTaskStatuses = (): Promise<TaskStatus[]> => getCollection<TaskStatus>('task_statuses');

const getProductionOrders = async (): Promise<ProductionOrder[]> => {
    const poCollection = await getCollection<ProductionOrder>('production_orders');
    const products = await getCollection<Product>('products');
    const productMap = new Map(products.map(p => [p.id, p]));
    return poCollection.map(po => ({
        ...po,
        product: productMap.get(po.product_id)
    }));
};

const getAllBasicMaterials = (): Promise<BasicMaterial[]> => getCollection<BasicMaterial>('materiais_basicos');

const getInventoryBalances = async (): Promise<InventoryBalance[]> => {
    const balances = await getCollection<InventoryBalance>('inventory_balances');
    const materials = await getAllBasicMaterials();
    const materialMap = new Map(materials.map(m => [m.id, m]));
    return balances.map(b => ({
        ...b,
        material: materialMap.get(b.material_id)
    }));
};


// --- Exported Service Object ---

export const firebaseService = {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  
  // App-specific methods
  getSettings: async (): Promise<AppData> => {
    const [
        paletas_cores,
        tecido, ziper, forro, puxador, vies, bordado, texturas,
        fontes_monogramas,
        grupos_suprimento,
        materiais_basicos,
        metodos_entrega,
        calculo_frete,
        tipos_embalagem,
        tipos_vinculo,
        sistema,
        orders,
        contacts,
        products,
        product_categories,
        production_orders,
        task_statuses,
        tasks,
        inventory_balances,
    ] = await Promise.all([
        getCollection('paletas_cores'),
        getCollection('tecido'), getCollection('ziper'), getCollection('forro'), getCollection('puxador'), getCollection('vies'), getCollection('bordado'), getCollection('texturas'),
        getCollection('fontes_monogramas'),
        getCollection('grupos_suprimento'),
        getAllBasicMaterials(),
        getCollection('metodos_entrega'),
        getCollection('calculo_frete'),
        getCollection('tipos_embalagem'),
        getCollection('tipos_vinculo'),
        getCollection<SystemSetting>('sistema'),
        getOrders(),
        getCollection<Contact>('contacts'),
        getProducts(),
        getProductCategories(),
        getProductionOrders(),
        getTaskStatuses(),
        getTasks(),
        getInventoryBalances(),
    ]);

    return {
        catalogs: {
            paletas_cores,
            cores_texturas: { tecido, ziper, forro, puxador, vies, bordado, texturas },
            fontes_monogramas
        },
        materials: {
            grupos_suprimento,
            materiais_basicos
        },
        logistica: {
            metodos_entrega,
            calculo_frete,
            tipos_embalagem,
            tipos_vinculo
        },
        sistema,
        midia: {},
        orders,
        contacts,
        products,
        product_categories,
        production_orders,
        task_statuses,
        tasks,
        omnichannel: { conversations: [], messages: [], quotes: [] },
        inventory_balances,
        inventory_movements: [],
    } as AppData;
  },

  // Settings
  addSetting: (category: SettingsCategory, data: any, subTab: string | null, subSubTab: string | null) => addDocument(getSettingsCollectionPath(category, subTab, subSubTab), data),
  updateSetting: (category: SettingsCategory, id: string, data: any, subTab: string | null, subSubTab: string | null) => updateDocument(getSettingsCollectionPath(category, subTab, subSubTab), id, data),
  deleteSetting: (category: SettingsCategory, id: string, subTab: string | null, subSubTab: string | null) => deleteDocument(getSettingsCollectionPath(category, subTab, subSubTab), id),
  updateSystemSettings: async (settings: SystemSetting[]) => {
      const batch = writeBatch(db);
      settings.forEach(setting => {
          const { id, ...data } = setting;
          const docRef = doc(db, 'sistema', id);
          batch.update(docRef, { ...data, updated_at: serverTimestamp() });
      });
      await batch.commit();
  },

  // Orders
  getOrders,
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
      await updateDocument('orders', orderId, { status: newStatus });
      const updatedOrder = await getDocument<Order>('orders', orderId);
      if (!updatedOrder) throw new Error("Order not found after update");
      if (updatedOrder.contact_id) {
          updatedOrder.contact = await getDocument<Contact>('contacts', updatedOrder.contact_id);
      }
      return updatedOrder;
  },
  addOrder: async (orderData: Partial<Order>) => {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const year = new Date().getFullYear();
      const orderNumber = `P-${year}-${(querySnapshot.size + 1).toString().padStart(4, '0')}`;
      return addDocument('orders', { ...orderData, order_number: orderNumber });
  },
  updateOrder: async (orderId: string, data: Partial<Order>): Promise<Order> => {
        await updateDocument('orders', orderId, data);
        const updatedOrder = await getDocument<Order>('orders', orderId);
        if (!updatedOrder) throw new Error("Order not found");
        return updatedOrder;
  },

  // Production
  getProductionOrders,
  getTasks,
  getTaskStatuses,
  updateTask: (taskId: string, data: Partial<Task>) => updateDocument('tasks', taskId, data),

  // Inventory
  getInventoryBalances,
  getAllBasicMaterials,
  getInventoryMovements: async (materialId: string): Promise<InventoryMovement[]> => {
      const q = query(collection(db, 'inventory_movements'),
        where('material_id', '==', materialId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryMovement));
  },
  addInventoryMovement: async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => {
        const batch = writeBatch(db);
        const balanceDocRef = doc(db, 'inventory_balances', movementData.material_id);
        const balanceDoc = await getDoc(balanceDocRef);

        if (balanceDoc.exists()) {
            const currentBalance = balanceDoc.data()!.quantity_on_hand;
            batch.update(balanceDocRef, { 
                quantity_on_hand: currentBalance + movementData.quantity, 
                last_updated_at: serverTimestamp() 
            });
        } else {
             batch.set(balanceDocRef, { 
                 material_id: movementData.material_id, 
                 quantity_on_hand: movementData.quantity,
                 quantity_reserved: 0,
                 low_stock_threshold: 10, // default
                 last_updated_at: serverTimestamp()
             });
        }
        
        const movementRef = doc(collection(db, "inventory_movements"));
        batch.set(movementRef, {...movementData, created_at: serverTimestamp()});

        await batch.commit();
  },
  
  // Products
  getProducts,
  getProductCategories,
  addProduct: (productData: AnyProduct) => addDocument('products', productData),
  updateProduct: (productId: string, productData: Product | AnyProduct) => {
      const { id, category, ...dataToUpdate } = productData as Product;
      return updateDocument('products', productId, dataToUpdate);
  },
};