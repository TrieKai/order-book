import { useEffect, useState, useRef } from 'react';

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [lastPrice, setLastPrice] = useState(null);
  const [prevLastPrice, setPrevLastPrice] = useState(null);
  const [lastSeqNum, setLastSeqNum] = useState(null);
  const wsRef = useRef(null);
  const tradeWsRef = useRef(null);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateTotal = (orders, isAsk) => {
    let total = 0;
    const result = [];
    
    if (isAsk) {
      for (let i = orders.length - 1; i >= 0; i--) {
        total += orders[i][1];
        result[i] = total;
      }
    } else {
      for (let i = 0; i < orders.length; i++) {
        total += orders[i][1];
        result[i] = total;
      }
    }
    
    return result;
  };

  const getLastPriceStyle = () => {
    if (!lastPrice || !prevLastPrice) return 'text-text-default bg-flash-red-bg';
    if (lastPrice > prevLastPrice) return 'text-price-buy bg-flash-green-bg';
    if (lastPrice < prevLastPrice) return 'text-price-sell bg-flash-red-bg';
    return 'text-text-default bg-flash-red-bg';
  };

  useEffect(() => {
    const orderBookWs = new WebSocket('wss://ws.btse.com/ws/oss/futures');
    const tradeWs = new WebSocket('wss://ws.btse.com/ws/futures');
    
    wsRef.current = orderBookWs;
    tradeWsRef.current = tradeWs;

    orderBookWs.onopen = () => {
      orderBookWs.send(JSON.stringify({
        op: 'subscribe',
        args: ['update:BTCPFC']
      }));
    };

    tradeWs.onopen = () => {
      tradeWs.send(JSON.stringify({
        op: 'subscribe',
        args: ['tradeHistoryApi:BTCPFC']
      }));
    };

    orderBookWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        if (data.data.type === 'snapshot') {
          setOrderBook({
            bids: data.data.bids.slice(0, 8),
            asks: data.data.asks.slice(0, 8)
          });
          setLastSeqNum(data.data.seqNum);
        } else if (data.data.type === 'delta') {
          if (data.data.prevSeqNum !== lastSeqNum) {
            // Resubscribe to get new snapshot
            orderBookWs.send(JSON.stringify({
              op: 'unsubscribe',
              args: ['update:BTCPFC']
            }));
            orderBookWs.send(JSON.stringify({
              op: 'subscribe',
              args: ['update:BTCPFC']
            }));
            return;
          }
          
          setOrderBook(prev => {
            const newBids = [...prev.bids];
            const newAsks = [...prev.asks];
            
            data.data.bids.forEach(bid => {
              const index = newBids.findIndex(b => b[0] === bid[0]);
              if (index !== -1) {
                if (bid[1] === 0) {
                  newBids.splice(index, 1);
                } else {
                  newBids[index] = bid;
                }
              } else if (bid[1] !== 0) {
                newBids.push(bid);
              }
            });
            
            data.data.asks.forEach(ask => {
              const index = newAsks.findIndex(a => a[0] === ask[0]);
              if (index !== -1) {
                if (ask[1] === 0) {
                  newAsks.splice(index, 1);
                } else {
                  newAsks[index] = ask;
                }
              } else if (ask[1] !== 0) {
                newAsks.push(ask);
              }
            });
            
            return {
              bids: newBids.sort((a, b) => b[0] - a[0]).slice(0, 8),
              asks: newAsks.sort((a, b) => a[0] - b[0]).slice(0, 8)
            };
          });
          setLastSeqNum(data.data.seqNum);
        }
      }
    };

    tradeWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data && data.data.length > 0) {
        setPrevLastPrice(lastPrice);
        setLastPrice(parseFloat(data.data[0].price));
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (tradeWsRef.current) {
        tradeWsRef.current.close();
      }
    };
  }, [lastPrice, lastSeqNum]);

  const askTotals = calculateTotal(orderBook.asks, true);
  const bidTotals = calculateTotal(orderBook.bids, false);
  const maxTotal = Math.max(...askTotals, ...bidTotals);

  return (
    <div className="bg-app-bg text-text-default p-4 font-mono">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Order Book</h2>
        <div className={`text-center py-2 px-4 rounded ${getLastPriceStyle()}`}>
          Last Price: {lastPrice ? formatNumber(lastPrice) : 'Loading...'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-text-secondary">Price (USD)</div>
        <div className="text-right text-text-secondary">Size</div>
        <div className="text-right text-text-secondary">Total</div>
      </div>

      <div className="space-y-1">
        {orderBook.asks.map((ask, index) => (
          <div
            key={ask[0]}
            className="grid grid-cols-3 gap-4 text-sm items-center hover:bg-hover-bg relative"
          >
            <div className="text-price-sell">{formatNumber(ask[0])}</div>
            <div className="text-right">{formatNumber(ask[1])}</div>
            <div className="text-right relative">
              <div
                className="absolute inset-0 bg-flash-red-bg"
                style={{
                  width: `${(askTotals[index] / maxTotal) * 100}%`,
                  zIndex: 0
                }}
              />
              <span className="relative z-10">{formatNumber(askTotals[index])}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-2 border-t border-hover-bg" />

      <div className="space-y-1">
        {orderBook.bids.map((bid, index) => (
          <div
            key={bid[0]}
            className="grid grid-cols-3 gap-4 text-sm items-center hover:bg-hover-bg relative"
          >
            <div className="text-price-buy">{formatNumber(bid[0])}</div>
            <div className="text-right">{formatNumber(bid[1])}</div>
            <div className="text-right relative">
              <div
                className="absolute inset-0 bg-flash-green-bg"
                style={{
                  width: `${(bidTotals[index] / maxTotal) * 100}%`,
                  zIndex: 0
                }}
              />
              <span className="relative z-10">{formatNumber(bidTotals[index])}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
