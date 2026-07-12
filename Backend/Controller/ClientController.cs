using Backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController() : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        [HttpGet]
        public IActionResult getClientId()
        {
            var clientName = Request.Headers["Client-Name"].ToString();
            if (string.IsNullOrEmpty(clientName))
            {
                return BadRequest(new { Message = "Client-Id header is missing." });
            }
            var clientID = _context.Clients.FirstOrDefault(c => c.CompanyName == clientName)?.ClientId;
            return Ok(new { ClientId = clientID });
        }
    }
}
