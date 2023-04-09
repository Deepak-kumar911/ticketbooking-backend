const router = require('express').Router();
const { Coach } = require('../model/booking')


router.get("/bookinglist",async(req,res)=>{
    try {
        const coach = await Coach.find();
        res.status(200).send(coach)
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})


// create seats as array of object
router.post("/creatCoach", async (req, res) => {
    try {
        const allSeats = [];
        let startingSeatNo = 1;
        for (let i = 0; i < req.body.no_of_seats; i++) {
            let creatSeat = { sNo: startingSeatNo, seatNo: `ABCD/${startingSeatNo}`, remark: "unbooked" };
            allSeats.push(creatSeat);
            startingSeatNo += 1
        }
        const coach = new Coach({
            no_of_seats: req.body.no_of_seats,
            booking: allSeats
        })

        await coach.save()
        res.status(201).send(coach)
    } catch (err) {
        res.status(500).send(err)
    }
})

//book ticket
router.patch("/ticketBooking/:_id", async (req, res) => {
    try {
        // for maximum booking
        if (req.body.seats > 7) return res.status(400).send("Maximum 7 seat booking at a time");
        //find coach for booking
        let coach = await Coach.findById(req.params._id);
        if (!coach) return res.status(404).send("Can not find Coach");
        // for find unbooked ticket
        const unbooked = coach.booking.filter(ticket => ticket.remark === "unbooked")
        // return if booing seats is greater than unbooked seats
        if(unbooked.length==0) return res.status(400).send("No seats are available")
        if(unbooked.length<req.body.seats) return res.status(400).send(`only ${unbooked.length} seat left`)

        const mainArray = [];
        const rowSeats = 7;
        const lastRowseats = 3
        let rowSeatPattern = [];
        let lastRowPattern = []
        // for creating pattern of [[{}],[{}],[{}]]
        for (let element of unbooked) {
            if (element.sNo <= (coach.no_of_seats - lastRowseats)) {
                if (element.sNo % rowSeats === element.sNo) {
                    if (element.sNo % rowSeats !== 0) {
                        rowSeatPattern.push(element);
                    }
                } else {
                    if (element.sNo % rowSeats === 0) {
                        rowSeatPattern.push(element);
                        mainArray.push(rowSeatPattern);
                        rowSeatPattern = []
                    } else {
                        rowSeatPattern.push(element);
                    }
                }
            } else {
                lastRowPattern.push(element);
            }
        };
        mainArray.push(lastRowPattern)
        const filterData = mainArray.filter(row=>row.length>=req.body.seats);

        // if seats are available in same row
        if(filterData.length!==0){
            const priority = filterData[0]
            const bookedTicket = []
            for(let i=0;i<req.body.seats;i++){
                coach = await Coach.updateOne({"booking._id":priority[i]._id},{$set:{"booking.$.remark":"booked"}},{new:true})
                if(coach.modifiedCount===1){
                    bookedTicket.push(priority[i].seatNo)}
            }
            res.status(200).send(bookedTicket)
        }else{
            // if seats are not available in same row
            const bookedTicket = []
            for(let i=0;i<req.body.seats;i++){
                coach = await Coach.updateOne({"booking._id":unbooked[i]._id},{$set:{"booking.$.remark":"booked"}},{new:true})
                if(coach.modifiedCount===1){
                    console.log(unbooked[i]);
                    bookedTicket.push(unbooked[i].seatNo)}
            }
            res.status(200).send(bookedTicket)
        }

    } catch(err){
        console.log(err);
        res.status(500).send(err)
    }
})

module.exports = router;
