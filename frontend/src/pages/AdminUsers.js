import { useEffect, useState } from "react";
import api from "../api";

export default function AdminUsers(){

const [users,setUsers] = useState([])

useEffect(()=>{
 fetchUsers()
},[])

const fetchUsers = async()=>{
 const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")

const res = await api.get("/auth/all-users",{
  headers:{ "x-auth-token": token }
})

 setUsers(res.data)
}

const approve = async (id) => {

 const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

 await api.put(`/auth/approve/${id}`, {}, {
   headers: { "x-auth-token": token }
 })

 fetchUsers()
}

const reject = async (id) => {

 const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

 await api.put(`/auth/reject/${id}`, {
   headers: { "x-auth-token": token }
 })

 fetchUsers()
}

const remove = async (id) => {

 const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

await api.delete(`/auth/remove/${id}`, {
   headers: { "x-auth-token": token }
})

 fetchUsers()
}

return(
<div className="users-page">

  <h2 className="users-title">All Users</h2>

  <div className="users-box">

    <table className="users-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u) => (
          <tr key={u.id}>

            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.role}</td>
            <td>{u.approvalStatus}</td>

            <td>

              {u.approvalStatus === "pending" && (
                <>
                  <button onClick={()=>approve(u.id)} className="accept-btn">
                    Accept
                  </button>

                  <button onClick={()=>reject(u.id)} className="decline-btn">
                    Decline
                  </button>
                </>
              )}

              <button onClick={()=>remove(u.id)} className="remove-btn">
                Remove
              </button>

            </td>

          </tr>
        ))}
      </tbody>

    </table>

  </div>

</div>
)
}