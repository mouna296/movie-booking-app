import { TicketIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";

const Purchase = (props) => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const showtime = location.state.showtime;
  const selectedSeats = location.state.selectedSeats || [];
  const [isPurchasing, SetIsPurchasing] = useState(false);
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [membership, setMembership] = useState("");
  const [isDiscounted, setIsDiscounted] = useState(false);

  const handleCheckboxChange = (isChecked) => {
    setIsDiscounted(isChecked);
    props.handleDiscount(isChecked)
  };



  const getUser = async () => {
	try {
	  if (!auth.token) return;

	  const response = await axios.get('/auth/me', {
		headers: {
		  Authorization: `Bearer ${auth.token}`,
		},
	  });
	  setRewardPoints(response.data.data.rewardPoints);
	  setMembership(response.data.data.membership);
	} catch (error) {
	  console.error(error);
	}
  };

  
  getUser(); 

  const onPurchase = async (data) => {
    SetIsPurchasing(true);
    try {
      let discount = props.discount;
      console.log("Discounted price set to:")
      console.log(discount)
      const response = await axios.post(
        `/showtime/${showtime._id}`,
        { seats: selectedSeats, useRewardPoints,discount },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
    
      navigate("/cinema");
      toast.success("Purchase seats successful!", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || "Error", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
      });
    } finally {
      SetIsPurchasing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br pb-8 sm:gap-8">
      <Navbar />
      <div className="mx-4 h-fit rounded-lg bg-gradient-to-br  p-4 drop-shadow-xl sm:mx-8 sm:p-6">
        <ShowtimeDetails showtime={showtime} />
        <div className="flex flex-col justify-between rounded-b-lg bg-gradient-to-br  text-center text-lg drop-shadow-lg md:flex-row">
          <div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
            <p className="font-semibold">Selected Seats:{props.discount}</p>
            <p className="text-start">{selectedSeats.join(", ")}</p>
            {!!selectedSeats.length && (
              <p className="whitespace-nowrap">
                ({selectedSeats.length} seats)
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row justify-end ml-auto">
  <div className="flex flex-col md:flex-row gap-4">
    <p className="font-semibold flex items-center justify-end gap-2 rounded-b-lg">
      <label className="items-center gap-2 rounded-b-lg px-4 py-1 bg-gradient-to-br from-slate-800 to-blue-700 font-semibold text-white md:rounded-none md:rounded-br-lg">
        <div>Tickets Price: ${props.discount ? 10 : 20}</div>
        <div>
          Service Fee{(membership === "Premium")
            ? "$0"
            : `($1.5/Ticket): $${selectedSeats.length * 1.5}`}
        </div>
        <div>
          Total: ${(membership === "Premium")
            ? isDiscounted
              ? 10
              : selectedSeats.length * 20
            : props.discount
            ? 10 + selectedSeats.length * 1.5
            : selectedSeats.length * 21.5}
        </div>
      </label>
    </p>
  </div>
</div>

        </div>

        <div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row justify-end">
          {selectedSeats.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex items-center gap-2 rounded-b-lg px-4 py-1 bg-gradient-to-br from-slate-700 to-blue-500 font-semibold text-white hover:from-red-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg">
                <input
                  type="checkbox"
                  checked={useRewardPoints}
                  onChange={() => setUseRewardPoints(!useRewardPoints)}
                  disabled={isPurchasing}
                />
                <div>
                  {useRewardPoints
                    ? "Cancel Reward Points"
                    : "Use Reward Points? Remaining points: $"+rewardPoints}
                </div>
              </label>
              {auth.role === 'admin' && (
              <label className="flex items-center gap-2 rounded-b-lg px-4 py-1 bg-gradient-to-br from-slate-800 to-blue-500 font-semibold text-white hover:from-red-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg">
                <input
                  type="checkbox"
                  checked={props.discount}
                  onChange={() => handleCheckboxChange(!props.discount)}
                  disabled={isPurchasing}
                />
                <div>
                  {props.discount
                    ? "Cancel Discount"
                    : "Apply Discount (if applicable)"}
                </div>
              </label>
               )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row justify-end">
          {selectedSeats.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => onPurchase()}
                className="flex items-center justify-center gap-2 rounded-b-lg  bg-gradient-to-br from-slate-800 to-blue-500 px-4 py-1 font-semibold text-white hover:from-red-500 hover:to-red-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg"
                disabled={isPurchasing}
              >
                {isPurchasing ? "Processing..." : "Confirm Purchase"}
                <TicketIcon className="h-7 w-7 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchase;