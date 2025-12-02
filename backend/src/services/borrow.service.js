import Borrow from "../models/borrow.model.js";
class BorrowService {

    async create(payload) {
        try {
            const borrow = new Borrow({
                user_id: payload.user_id,
                book_id: payload.book_id,
                borrow_date: payload.borrow_date || new Date(),
                return_date: payload.return_date || null,
                status: payload.status || "pending"
            });
            Object.keys(borrow).forEach(key => {
                if (borrow[key] === undefined || borrow[key] === null || borrow[key] === "") {
                    delete borrow[key];
                }
            });
            return await borrow.save();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async find(filter) {
        return await Borrow.find(filter)
            .populate("user_id")
            .populate({
                path: "book_id",
                populate: {
                    path: "publisher_id",
                    model: "Publisher"
                }
            }).populate({
                path: "staff_id",
                model: "Staff"
            });
    }

    async findById(id) {
        return await Borrow.findById(id)
            .populate("user_id")
            .populate({
                path: "book_id",
                populate: {
                    path: "publisher_id",
                    model: "Publisher"
                }
            }).populate({
                path: "staff_id",
                model: "Staff"
            });
    }

    async findByUserId(user_id) {
        return await Borrow.find({ user_id: user_id });
    }

    async update(id, payload) {
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === "" || payload[key] === null) {
                delete payload[key];
            }
        });

        const result = await Borrow.findByIdAndUpdate(
            id,
            { $set: payload },
            {
                new: true,
                runValidators: true
            }
        );
        return result;
    }

    async delete(id) {
        const result = await Borrow.findByIdAndDelete(id);
        return result;
    }

    async deleteAll() {
        const result = await Borrow.deleteMany({});
        return result.deletedCount;
    }
}

export default BorrowService;