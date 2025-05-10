import { useEffect, useState } from 'react';
import api_url from '../api.tsx';
import Navbar from '../components/Navbar.tsx';
interface InventoryItem {
    id: string;
    item: string;
    count: number;
    rescueCenter: string;
}

interface RequestItem {
    id: string;
    item: string;
    count: number;
    fromCenter: string;
}

interface RescueCenter {
    [key: string]: string;
}

const ManageInventory = () => {
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>([]); 
    const [RC, setRC] = useState<RescueCenter>({});
    const [loading, setLoading] = useState(true);
    const [adminRescueCenter,setAdminRescueCenter] = useState('');
    const [transItem, setTransItem] = useState('');
    const [transLocation, setTransLocation] = useState('');
    const [transCount, setTransCount] = useState(0);

    // Modal States
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showAddItemsModal, setShowAddItemsModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [requestItem, setRequestItem] = useState('');
    const [requestCount, setRequestCount] = useState('');
    const [addItem, setAddItem] = useState('');
    const [addCount, setAddCount] = useState('');

    const getRescueCenterName = async() => {
        try{
            const responses = await fetch(`${api_url}/getRCName`,{
                method:'GET',
                headers:{'Content-Type':'application/json'},
                credentials:'include',
            });
            const result = await responses.json();
            setAdminRescueCenter(result);
        }catch(e){
            console.log(e);
        }
    }

    const handleTransferRequest = async () => {
        try {
            const response = await fetch(`${api_url}/manageInv`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    item: transItem,
                    count: transCount,
                    toCenter: transLocation,
                    fromCenter: adminRescueCenter
                })
            });
            const result = await response.json();
            console.log(result);
            setShowTransferModal(false);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getRescueCenterName();
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ rcRes, reqRes] = await Promise.all([
                fetch(`${api_url}/getRC`),
                fetch(`${api_url}/getInvReqRC`,{
                    method:'GET',
                    headers:{'Content-Type':'application/json'},
                    credentials:'include',
                })
            ]);

            const inventoryRes= await fetch(`${api_url}/getInv`,{
                method:'GET',
                headers:{'Content-Type':'application/json'},
                credentials:'include',
            });
            

            const inventoryResult = await inventoryRes.json();
            const rcResult = await rcRes.json();
            const reqResult = await reqRes.json();
            
            // Update state with fetched data
            setInventoryData(inventoryResult);
            setIncomingRequests(reqResult);
            
            // Create rescue center mapping
            const rescueCenterMap = rcResult.reduce((acc: RescueCenter, item: any) => {
                acc[item._id.toString()] = item.location;
                return acc;
            }, {} as RescueCenter);
            
            setRC(rescueCenterMap);
            console.log(reqResult);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    
    const handleMakeRequest = () => {
        setShowRequestModal(true);
    };

    const handleSubmitRequest = async () => {
        if (!requestItem || !requestCount) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch('${api_url}/invReqRC', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    item: requestItem,
                    count: parseInt(requestCount, 10),
                    fromCenter: adminRescueCenter,
                }),
            });

            const result = await response.json();
            console.log(result);
            setShowRequestModal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddItems = () => {
        setShowAddItemsModal(true);
    }

    const handleSubmitAddItems = async () => {
        if (!addItem || !addCount) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch(`${api_url}/addInventory`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    item: addItem,
                    count: parseInt(addCount, 10),
                    rescueCenters: adminRescueCenter,
                }),
            });

            const result = await response.json();
            console.log(result);
            setShowAddItemsModal(false);
            fetchData(); // Refresh inventory data after adding items
        } catch (error) {
            console.error(error);
        }
    };


    
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            
            <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-screen-xl">
                <div className="flex justify-between items-center py-8">
                    <h2 className="text-3xl font-bold text-gray-900">Manage Inventory</h2>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            onClick={handleAddItems}
                        >
                            Add Items
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            onClick={handleMakeRequest}
                        >
                            Make a Request
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : (
                    <div className="space-y-8">
                        {/* Inventory Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-blue-800 border-b">
                                <h3 className="text-xl font-semibold text-white">Current Inventory</h3>
                            </div>
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-3 text-left text-gray-600">Item</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {inventoryData.map((data) => (
                                        <tr key={data.id}>
                                            <td className="px-6 py-4 text-gray-900">{data.item}</td>
                                            <td className="px-6 py-4 text-gray-900">{data.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Incoming Requests Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-blue-800 border-b">
                                <h3 className="text-xl font-semibold text-white">Incoming Requests</h3>
                            </div>
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-3 text-left text-gray-600">Item</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Count</th>
                                        <th className="px-6 py-3 text-left text-gray-600">From Center</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {incomingRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 text-gray-900">{request.item}</td>
                                            <td className="px-6 py-4 text-gray-900">{request.count}</td>
                                            <td className="px-6 py-4 text-gray-900">{RC[request.fromCenter] || request.fromCenter}</td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    type="button"
                                                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                                                    onClick={() => {
                                                        setShowTransferModal(true);
                                                        setTransItem(request.item);
                                                        setTransLocation(RC[request.fromCenter] || request.fromCenter);
                                                    }}
                                                >
                                                    Transfer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Request Modal */}
                {showRequestModal && (
                    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-semibold mb-4">Request Item</h3>
                            <label className="block mb-2 text-gray-700">Item:</label>
                            <input
                                type="text"
                                value={requestItem}
                                onChange={(e) => setRequestItem(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md mb-6"
                                placeholder="Enter item name"
                                title="Item name"
                            />
                            <label className="block mb-2 text-gray-700">Count:</label>
                            <input
                                type="number"
                                value={requestCount}
                                onChange={(e) => setRequestCount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md mb-6"
                                placeholder="Enter quantity"
                                title="Quantity"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 mr-2"
                                    onClick={() => setShowRequestModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    onClick={handleSubmitRequest}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showAddItemsModal && (
                    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-semibold mb-4">Add Item</h3>
                            <label className="block mb-2 text-gray-700">Item:</label>
                            <input
                                type="text"
                                value={addItem}
                                onChange={(e) => setAddItem(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md mb-6"
                                placeholder="Enter item name"
                                title="Item name"
                            />
                            <label className="block mb-2 text-gray-700">Count:</label>
                            <input
                                type="number"
                                value={addCount}
                                onChange={(e) => setAddCount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md mb-6"
                                placeholder="Enter quantity"
                                title="Quantity"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 mr-2"
                                    onClick={() => setShowAddItemsModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    onClick={handleSubmitAddItems}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-semibold mb-4">Transfer Item</h3>
                            <label className="block mb-2 text-gray-700" htmlFor="transferItem">Item:</label>
                            <input
                                id="transferItem"
                                type="text"
                                value={transItem}
                                readOnly
                                className="w-full px-3 py-2 border rounded-md mb-6 bg-gray-100"
                            />
                            <label className="block mb-2 text-gray-700" htmlFor="toCenter">To Center:</label>
                            <input
                                id="toCenter"
                                type="text"
                                value={transLocation}
                                readOnly
                                className="w-full px-3 py-2 border rounded-md mb-6 bg-gray-100"
                            />
                            <label className="block mb-2 text-gray-700" htmlFor="transferCount">Count:</label>
                            <input
                                id="transferCount"
                                type="number"
                                value={transCount}
                                onChange={(e) => setTransCount(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md mb-6"
                                placeholder="Enter quantity to transfer"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 mr-2"
                                    onClick={() => setShowTransferModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    onClick={handleTransferRequest}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageInventory;